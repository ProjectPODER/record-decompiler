function recordDecompiler(ocid, record) {
    return [record.compiledRelease];
}

function getIDFieldName() {
    return 'id';
}

module.exports = { recordDecompiler, getIDFieldName };
