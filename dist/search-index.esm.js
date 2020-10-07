import fii from 'fergies-inverted-index';
import tv from 'term-vector';

// as per https://stackoverflow.com/a/48902765/54086
const matchLettersInAllLanguages = /[^\s0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/gi;

const scoreArrayTFIDF = arr => {
  const v = tv(arr);
  const mostTokenOccurances = v.reduce((acc, cur) => Math.max(cur.positions.length, acc), 0);
  return v
    .map(item => item.term[0] + '#' +
              (((item.positions.length / mostTokenOccurances)).toFixed(2)))
};

function writer (fii, ops) {
  // traverse object, tokenising all leaves (strings to array) and then
  // scoring them
  // `ops` is a collection of indexing pipeline options
  const createDocumentVector = obj => Object.entries(obj).reduce((acc, [
    fieldName, fieldValue
  ]) => {
    // if fieldname is undefined, ignore and procede to next
    if (fieldValue === undefined) return acc
    /* ops = Object.assign({
     *   caseSensitive: false
     * }, ops || {}) */
    if (fieldName === '_id') {
      acc[fieldName] = fieldValue + ''; // return _id "as is" and stringify
    } else if (Array.isArray(fieldValue)) {
      // split up fieldValue into an array or strings and an array of
      // other things. Then term-vectorize strings and recursively
      // process other things.
      const strings = scoreArrayTFIDF(
        fieldValue
          .filter(item => typeof item === 'string')
          .map(str => ops.caseSensitive ? str : str.toLowerCase())
      );
      const notStrings = fieldValue.filter(
        item => typeof item !== 'string'
      ).map(createDocumentVector);
      acc[fieldName] = strings.concat(notStrings).sort();
    } else if (typeof fieldValue === 'object') {
      acc[fieldName] = createDocumentVector(fieldValue);
    } else {
      let str = fieldValue.toString().replace(matchLettersInAllLanguages, '');
      if (!ops.caseSensitive) str = str.toLowerCase();
      acc[fieldName] = scoreArrayTFIDF(str.split(' ')).sort();
    }
    return acc
  }, {});

  const incrementDocCount = increment => fii.STORE.get(
    '￮DOCUMENT_COUNT￮'
  ).then(
    count => fii.STORE.put('￮DOCUMENT_COUNT￮', +count + increment)
  ).catch(
    // if not found assume value to be 0
    e => fii.STORE.put('￮DOCUMENT_COUNT￮', increment)
  );

  const decrementDocCount = increment => fii.STORE.get(
    '￮DOCUMENT_COUNT￮'
  ).then(
    count => fii.STORE.put('￮DOCUMENT_COUNT￮', +count - increment)
  );

  const parseStringAsDoc = doc => (typeof doc === 'string') ? (
    { body: doc }
  ) : doc;

  // TODO: generated IDs are derived from timestamps. Possibly there
  // should be some sort of timer here that makes sure that this
  // function uses at least 1 millisecond in order to avoid id collisions
  const generateId = (doc, i) => (typeof doc._id === 'undefined')
    ? Object.assign(doc, {
      _id: Date.now() + '-' + i
    })
    : doc;

  const indexingPipeline = docs => new Promise(
    resolve => resolve(
      docs
        .map(parseStringAsDoc)
        .map(generateId)
    )
  );

  const _PUT = (docs, putOptions) => indexingPipeline(docs).then(
    docs => fii.PUT(
      docs.map(createDocumentVector), putOptions
    ).then(
      result => (
        (putOptions || {}).dontStoreRawDocs
          ? Promise.all([])
          : _PUT_RAW(docs)
      ).then(
        () => incrementDocCount(result.length)
      ).then(() => result)
    )
  );

  const _PUT_RAW = docs => Promise.all(
    docs.map(
      doc => fii.STORE.put('￮DOC_RAW￮' + doc._id + '￮', doc)
    )
  ).then(
    // TODO: make this actually deal with errors
    result => docs.map(
      doc => ({
        _id: doc._id,
        status: 'OK',
        operation: '_PUT_RAW'
      })
    )
  );

  const _DELETE = _ids => fii.DELETE(_ids).then(
    result => Promise.all(
      result.map(r => fii.STORE.del('￮DOC_RAW￮' + r._id + '￮'))
    ).then(
      result => decrementDocCount(_ids.length).then(() => _ids.map(
        _id => ({
          _id: _id,
          operation: 'DELETE',
          status: 'OK'
        })
      ))
    )
  );

  return {
    // TODO: DELETE should be able to handle errors (_id not found etc.)
    DELETE: docIds => _DELETE(docIds), // for external use
    IMPORT: fii.IMPORT,
    PUT: _PUT,
    PUT_RAW: _PUT_RAW,
    _DELETE: _DELETE, // for internal use
    _PUT: _PUT,
    _PUT_RAW: _PUT_RAW
  }
}

function reader (fii) {
  const BUCKETS = (...buckets) => Promise.all(
    buckets.map(fii.BUCKET)
  );

  const DOCUMENTS = requestedDocs => {
    // Either return document per id
    return (Array.isArray(requestedDocs))
      ? Promise.all(
        requestedDocs.map(
          doc => fii.STORE.get('￮DOC_RAW￮' + doc._id + '￮').catch(e => null)
        )
      ).then(returnedDocs => requestedDocs.map(
        (rd, i) => Object.assign(rd, { _doc: returnedDocs[i] })
      ))
      : new Promise((resolve, reject) => {
        var result = [];
        fii.STORE.createReadStream({
          gte: '￮DOC_RAW￮',
          lte: '￮DOC_RAW￮￮'
        }).on('data', d => result.push({
          _id: d.value._id,
          _doc: d.value
        })).on('end', () => resolve(result));
      })
  };

  const DICTIONARY = token => DISTINCT(token).then(results =>
    Array.from(results.reduce(
      (acc, cur) => acc.add(cur.VALUE), new Set())
    ).sort()
  );

  const DISTINCT = (...tokens) => fii.DISTINCT(
    ...tokens
  ).then(result => [
    // Stringify Set entries so that Set can determine duplicates
    ...result.reduce((acc, cur) => acc.add(JSON.stringify(
      Object.assign(cur, {
        VALUE: cur.VALUE.split('#')[0]
      })
    )), new Set())
  ].map(JSON.parse)); // un-stringify

  const PAGE = (results, options) => {
    options = Object.assign({
      NUMBER: 0,
      SIZE: 20
    }, options || {});
    const start = options.NUMBER * options.SIZE;
    // handle end index correctly when (start + size) == 0
    // (when paging from the end with a negative page number)
    const end = (start + options.SIZE) || undefined;
    return results.slice(start, end)
  };

  // score by tfidf by default
  // TODO: should also be an option to score by field
  // TODO: Total hits (length of _match)
  const SCORE = (results, type) => {
    type = type || 'TFIDF'; // default
    if (type === 'TFIDF') {
      return DOCUMENT_COUNT().then(
        docCount => results.map((x, _, resultSet) => {
          const idf = Math.log((docCount + 1) / resultSet.length);
          x._score = +x._match.reduce(
            (acc, cur) => acc + idf * +cur.split('#')[1], 0
          ).toFixed(2); // TODO: make precision an option
          return x
        })
      )
    }
    if (type === 'PRODUCT') {
      return new Promise(resolve => resolve(
        results.map(r => {
          r._score = +r._match.reduce(
            (acc, cur) => acc * +cur.split('#')[1], 1
          ).toFixed(2); // TODO: make precision an option
          return r
        })
      ))
    }
    if (type === 'CONCAT') {
      return new Promise(resolve => resolve(
        results.map(r => {
          r._score = r._match.reduce(
            (acc, cur) => acc + cur.split('#')[1], ''
          );
          return r
        })
      ))
    }
    if (type === 'SUM') {
      return new Promise(resolve => resolve(
        results.map(r => {
          r._score = +r._match.reduce(
            (acc, cur) => acc + +cur.split('#')[1], 0
          ).toFixed(2); // TODO: make precision an option
          return r
        })
      ))
    }
  };

  const SEARCH = (...q) => fii
    .AND(...q)
    .then(SCORE)
    .then(SORT);

  const SORT = (results, options) => {
    options = Object.assign({
      DIRECTION: 'DESCENDING',
      FIELD: '_score',
      TYPE: 'NUMERIC'
    }, options || {});
    const deepRef = obj => {
      const path = options.FIELD.split('.');
      // TODO: dont like doing it this way- there should probably be a
      // way to dump the literal field value into _score, and always
      // sort on _score
      //
      // That said, it should be possible to score without fetching
      // the whole document for each _id
      //
      // special case: sorting on _match so that you dont have to
      // fetch all the documents before doing a sort
      return (path[0] === '_match')
        ? (obj._match.find(
          _match => (path.slice(1).join('.') === _match.split(':')[0])
          // gracefully fail if field name not found
        ) || ':#').split(':')[1].split('#')[0]
        : path.reduce((o, i) => o[i], obj)
    };
    const sortFunction = {
      'NUMERIC': {
        'DESCENDING': (a, b) => +deepRef(b) - +deepRef(a),
        'ASCENDING': (a, b) => +deepRef(a) - +deepRef(b)
      },
      'ALPHABETIC': {
        'DESCENDING': (a, b) => {
          if (deepRef(a) < deepRef(b)) return 1
          if (deepRef(a) > deepRef(b)) return -1
          return 0
        },
        'ASCENDING': (a, b) => {
          if (deepRef(a) < deepRef(b)) return -1
          if (deepRef(a) > deepRef(b)) return 1
          return 0
        }
      }
    };
    return results.sort(sortFunction[options.TYPE][options.DIRECTION])
  };

  const DOCUMENT_COUNT = () => fii.STORE.get('￮DOCUMENT_COUNT￮');

  // This function reads queries in a JSON format and then translates them to
  // Promises
  const parseJsonQuery = (...q) => {
    const getBuckets = bkts => bkts.DISTINCT
      ? DISTINCT(bkts.DISTINCT).then(
        dist => BUCKETS(...dist)
      ) : BUCKETS(...bkts);

    // needs to be called with "command" and result from previous "thenable"
    var promisifyQuery = (command, resultFromPreceding) => {
      if (typeof command === 'string') return fii.GET(command)
      if (command.FIELD) return fii.GET(command)
      if (command.VALUE) return fii.GET(command)
      if (command.AND) return fii.AND(...command.AND.map(promisifyQuery))
      if (command.BUCKETFILTER) {
        return fii.BUCKETFILTER(
          getBuckets(command.BUCKETFILTER.BUCKETS),
          promisifyQuery(command.BUCKETFILTER.FILTER)
        )
      }
      if (command.BUCKETS) return getBuckets(command.BUCKETS)
      if (command.DICTIONARY) return DICTIONARY(command.DICTIONARY)
      if (command.DISTINCT) return DISTINCT(...command.DISTINCT)
      // feed in preceding results if present (ie if not first promise)
      if (command.DOCUMENTS) return DOCUMENTS(resultFromPreceding || command.DOCUMENTS)
      if (command.DOCUMENT_COUNT) return DOCUMENT_COUNT()
      if (command.FIELDS) return fii.FIELDS()
      if (command.GET) return fii.GET(command.GET)
      if (command.MAX) return fii.MAX(command.MAX)
      if (command.MIN) return fii.MIN(command.MIN)
      if (command.NOT) {
        return fii.SET_SUBTRACTION(
          promisifyQuery(command.NOT.INCLUDE),
          promisifyQuery(command.NOT.EXCLUDE)
        )
      }
      if (command.OR) return fii.OR(...command.OR.map(promisifyQuery))
      if (command.PAGE) return PAGE(resultFromPreceding, command.PAGE)
      if (command.SCORE) return SCORE(resultFromPreceding, command.SCORE)
      if (command.SEARCH) return SEARCH(...command.SEARCH.map(promisifyQuery))
      if (command.SORT) return SORT(resultFromPreceding, command.SORT)
    };
    // Turn the array of commands into a chain of promises
    return q.reduce((acc, cur) => acc.then(
      result => promisifyQuery(cur, result)
    ), promisifyQuery(q.shift())) // <- Separate the first promise in the chain
    //                                  to be used as the start point in .reduce
  };

  return {
    // TODO: Should be own function?
    BUCKETS: BUCKETS,
    DICTIONARY: DICTIONARY,
    DISTINCT: DISTINCT,
    DOCUMENTS: DOCUMENTS,
    DOCUMENT_COUNT: DOCUMENT_COUNT,
    FIELDS: fii.FIELDS,
    PAGE: PAGE,
    SCORE: SCORE,
    SEARCH: SEARCH,
    SORT: SORT,
    QUERY: parseJsonQuery
  }
}

const makeASearchIndex = (idx, ops) => {
  const w = writer(idx, ops);
  const r = reader(idx);
  return {
    // internal functions inherited from fergies-inverted-index
    _AND: idx.AND,
    _BUCKET: idx.BUCKET,
    _BUCKETFILTER: idx.BUCKETFILTER,
    _FIELDS: idx.FIELDS,
    _GET: idx.GET,
    _MAX: idx.MAX,
    _MIN: idx.MIN,
    _NOT: idx.SET_SUBTRACTION,
    _OR: idx.OR,

    // search-index read
    _BUCKETS: r.BUCKETS,
    _DISTINCT: r.DISTINCT,
    _DOCUMENTS: r.DOCUMENTS,
    _DOCUMENT_COUNT: r.DOCUMENT_COUNT,
    _PAGE: r.PAGE,
    _SCORE: r.SCORE,
    _SEARCH: r.SEARCH,
    _SORT: r.SORT,

    // search-index write
    _DELETE: w.DELETE,
    _PUT: w._PUT,
    _PUT_RAW: w._PUT_RAW,

    // public API
    DELETE: w.DELETE,
    DICTIONARY: r.DICTIONARY,
    DOCUMENT_COUNT: r.DOCUMENT_COUNT,
    EXPORT: idx.EXPORT,
    FIELDS: r.FIELDS,
    IMPORT: idx.IMPORT,
    INDEX: idx,
    PUT: w.PUT,
    PUT_RAW: w.PUT_RAW,
    QUERY: r.QUERY
  }
};

function main (ops) {
  return new Promise((resolve, reject) => {
    ops = Object.assign({
      tokenAppend: '#',
      caseSensitive: false
    }, ops || {});
    // if a fergies-inverted-index is passed as an option
    if (ops.fii) return resolve(makeASearchIndex(ops.fii, ops))
    // else make a new fergies-inverted-index
    fii(ops, (err, idx) => {
      if (err) return reject(err)
      resolve(makeASearchIndex(idx, ops));
    });
  })
}

export default main;
