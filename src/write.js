// export default function (fii, ops) {
module.exports = (ops, cache, queue) => {
  const createDocumentVector = (docs, putOptions) => {
    // tokenize
    // lowcase
    // ngrams
    // stopwords
    // synonyms
    // score
    const runTokenizationPipeline = (fieldName, str) =>
      putOptions.tokenizationPipeline.reduce(
        (acc, cur) => cur(acc, fieldName, putOptions),
        str
      )

    // traverse object, tokenising all leaves (strings to array) and then
    // scoring them
    // `ops` is a collection of indexing pipeline options
    const traverseObject = obj =>
      Object.entries(obj).reduce((acc, [fieldName, fieldValue]) => {
        // if fieldname is undefined, ignore and procede to next
        if (fieldValue === undefined) return acc

        // if fieldName is '_id', return _id "as is" and stringify
        if (fieldName === '_id') {
          // acc[fieldName] = fieldValue + ''
          acc[fieldName] = fieldValue
          return acc
        }

        // If fieldValue is an Array
        if (Array.isArray(fieldValue)) {
          // split up fieldValue into an array of strings and an array of
          // other things. Then tokenize strings and recursively process
          // other things.
          const strings = fieldValue.filter(item => typeof item === 'string')
          const notStrings = fieldValue.filter(item => typeof item !== 'string')
          acc[fieldName] = [
            ...strings.map(str => runTokenizationPipeline(fieldName, str)),
            ...notStrings.map(traverseObject)
          ].sort()
          return acc
        }

        // If fieldValue is an Object
        if (typeof fieldValue === 'object') {
          acc[fieldName] = traverseObject(fieldValue)
          return acc
        }

        // TODO: own tokenization pipeline for numbers

        // else fieldvalue is Number or String
        if (typeof fieldValue === 'string') {
          acc[fieldName] = runTokenizationPipeline(
            fieldName,
            fieldValue.toString()
            // fieldValue
          )
        }

        // else fieldvalue is Number or String
        if (typeof fieldValue === 'number') {
          acc[fieldName] = JSON.stringify([fieldValue, fieldValue])
        }

        return acc
      }, {})

    // remove fields who's value is []
    // (matching empty arrays in js is messier than you might think...)
    const removeEmptyFields = doc => {
      Object.keys(doc).forEach(fieldName => {
        if (Array.isArray(doc[fieldName])) {
          if (doc[fieldName].length === 0) {
            delete doc[fieldName]
          }
        }
      })
      return doc
    }

    //   console.log(docs.map(traverseObject).map(removeEmptyFields))

    return docs.map(traverseObject).map(removeEmptyFields)
  }

  const incrementDocCount = increment =>
    ops.fii.STORE.get(['DOCUMENT_COUNT'])
      .then(count => ops.fii.STORE.put(['DOCUMENT_COUNT'], +count + increment))
      .catch(
        // if not found assume value to be 0
        e => ops.fii.STORE.put(['DOCUMENT_COUNT'], increment)
      )

  const decrementDocCount = increment =>
    ops.fii.STORE.get(['DOCUMENT_COUNT']).then(count =>
      ops.fii.STORE.put(['DOCUMENT_COUNT'], +count - increment)
    )

  const parseStringAsDoc = doc =>
    typeof doc === 'string' ? { body: doc } : doc

  let counter = 0
  const generateId = (doc, i) =>
    typeof doc._id === 'undefined'
      ? Object.assign(doc, {
          // counter is needed because if this function is called in quick
          // succession, Date.now() is not guaranteed to be unique. This could
          // still conflict if the DB is closed, clock is reset to the past, then
          // DB reopened. That's a bit of a corner case though.
          _id: `${Date.now()}-${i}-${counter++}`
        })
      : doc

  const _PUT = (docs, putOptions) => {
    putOptions = Object.assign(ops, putOptions)

    const rawDocs = docs.map(parseStringAsDoc).map(generateId)

    return ops.fii
      .PUT(createDocumentVector(rawDocs, putOptions), putOptions)
      .then(result =>
        Promise.all([
          _PUT_RAW(rawDocs, !ops.storeRawDocs),
          incrementDocCount(result.filter(r => r.status === 'CREATED').length)
        ]).then(() => result)
      )
  }

  const _PUT_RAW = (docs, dontStoreValue) =>
    Promise.all(
      docs.map(doc =>
        ops.fii.STORE.put(['DOC_RAW', doc._id], dontStoreValue ? {} : doc)
      )
    ).then(
      // TODO: make this actually deal with errors
      result =>
        docs.map(doc => ({
          _id: doc._id,
          status: 'OK',
          operation: '_PUT_RAW'
        }))
    )

  const _DELETE = _ids =>
    ops.fii.DELETE(_ids).then(result => {
      const deleted = result.filter(d => d.status === 'DELETED')
      return Promise.all([
        Promise.all(deleted.map(r => ops.fii.STORE.del(['DOC_RAW', r._id]))),
        decrementDocCount(deleted.length)
      ]).then(() => result)
    })

  const _FLUSH = () =>
    ops.fii.STORE.clear()
      .then(() => {
        const timestamp = Date.now()
        return ops.fii.STORE.batch([
          { type: 'put', key: ['~CREATED'], value: timestamp },
          { type: 'put', key: ['~LAST_UPDATED'], value: timestamp },
          { type: 'put', key: ['DOCUMENT_COUNT'], value: 0 }
        ])
      })
      .then(() => true)

  return {
    DELETE: (...docIds) => cache.flush().then(() => _DELETE(docIds)), // for external use
    FLUSH: () => cache.flush().then(_FLUSH),
    IMPORT: () => cache.flush().then(ops.fii.IMPORT),
    PUT: (docs, pops) =>
      cache.flush().then(
        // PUTs must be run in sequence and are therefore enqueued
        () => queue.add(() => _PUT(docs, pops))
      ),
    PUT_RAW: docs => cache.flush().then(() => _PUT_RAW(docs)),
    _INCREMENT_DOC_COUNT: incrementDocCount
  }
}
