function recordDecompiler(ocid, record) {
    return pieces = getContractsFromRecord(record.compiledRelease);
}

function getIDFieldName() {
    return 'ocid';
}

function getContractsFromRecord(record) {
    let contracts = [];

    record.contracts.map( (contract) => {
        let buyer_id = record.buyer.id;
        let buyer_party = record.parties.filter( (party) => party.id == buyer_id )[0];
        let award_id = contract.awardID;
        let award = record.awards.filter( (award) => award.id == award_id )[0];
        let supplier_ids = [];
        award.suppliers.map( (supplier) => supplier_ids.push(supplier.id) );
        let supplier_parties = record.parties.filter( (party) => supplier_ids.indexOf(party.id) >= 0 );
        let urls = [];
        if(award.hasOwnProperty('documents') && award.documents.length > 0) {
            award.documents.map( (doc) => urls.push(doc.url) );
        }

        let funder_party = null;
        let funder_arr = record.parties.filter( (party) => party.roles[0] == "funder" );
        if(funder_arr.length > 0) funder_party = funder_arr[0];

        let computed_contract = {};
        computed_contract.url = urls;

        for( var x in record ) {
            switch(x) {
                case 'parties':
                    computed_contract.parties = {};
                    if(buyer_party)
                        computed_contract.parties['buyer'] = simplifyObject(buyer_party);
                    if(supplier_parties.length > 0) {
                        computed_contract.parties['supplier'] = [];
                        computed_contract.parties.supplier_names = [];
                        computed_contract.parties.supplier_ids = [];
                        supplier_parties.map( (supplier, index) => {
                            computed_contract.parties['supplier'].push(simplifyObject(supplier));
                            computed_contract.parties['supplier_names'].push(supplier.name);
                            computed_contract.parties['supplier_ids'].push(supplier.id);
                        } );
                    }
                    if(funder_party) {
                        computed_contract.parties.funder_names = [];
                        computed_contract.parties.funder_ids = [];
                        computed_contract.parties['funder'] = [];
                        if(funder_party.name.indexOf(';')) {
                            let funder_names = funder_party.name.split(';');
                            let funder_ids = funder_party.id.split(';');
                            funder_names.map( (f, i) => {
                                let f_party = JSON.parse(JSON.stringify(funder_party));
                                f_party.name = f;
                                f_party.id = funder_ids[i];
                                computed_contract.parties['funder'].push(simplifyObject(f_party));
                                computed_contract.parties['funder_names'].push(f_party.name);
                                computed_contract.parties['funder_ids'].push(f_party.id);
                            } );
                        }
                        else {
                            computed_contract.parties['funder'].push(simplifyObject(funder_party));
                            computed_contract.parties['funder_names'].push(f_party.name);
                            computed_contract.parties['funder_ids'].push(f_party.id);
                        }
                    }
                    break;
                case 'buyer':
                    let buyerObj = record['buyer'];
                    if(buyer_party.hasOwnProperty('memberOf'))
                        buyerObj['memberOf'] = computed_contract.parties['buyer'].memberOf;
                    computed_contract['buyer'] = buyerObj;
                    break;
                case 'awards':
                    computed_contract.awards = simplifyObject(award);
                    break;
                case 'contracts':
                    computed_contract.contracts = simplifyObject(contract);
                    break;
                case 'total_amount':
                    break;
                default:
                    computed_contract[x] = simplifyObject(record[x]);
                    break;
            }
        }
        contracts.push(computed_contract);
    } );

    return contracts;
}

function simplifyObject(obj) {
    if(obj == null) return '';
    // - Si es un valor, copiarlo
    // - Si es objeto, recursar
    // - Si es array
    //     - Si solo tiene un elemento, volver objeto
    //     - Si tiene más de un elemento
    //         - Si son objetos, objeto indexado
    //         - Si son valores, dejarlo como array
    let objType = getType(obj);
    let tempObj = {};

    switch(objType) {
        case 'array':
            if(obj.length == 1) {
                return obj[0];
            }
            else {
                obj.map((item, index) => {
                    if(getType(item) == 'object') {
                        tempObj[index] = simplifyObject(item);
                    }
                    else {
                        tempObj[index] = item;
                    }
                });
                return tempObj;
            }
            break;
        case 'object':
            Object.keys(obj).map((key) => {
                tempObj[key] = simplifyObject(obj[key]);
            });
            return tempObj
        default:
            return obj;
    }
}

// Returns if a value is a string
function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

// Returns if a value is an array
function isArray (value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

// Returns if a value is an object
function isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
}

// Return the type of an object using above functions
function getType(obj) {
    if( isArray(obj) ) return 'array';
    else if( isObject(obj) ) return 'object';
    else return isString(obj)? 'string' : typeof obj;
}

module.exports = { recordDecompiler, getIDFieldName };