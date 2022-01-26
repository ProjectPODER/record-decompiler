# record-decompiler

Decompile records from a MongoDB collection into flattened structures ideal for streaming into tools like Kibana.

## Usage

    (streamed input) | node index.js -d [DATABASE] -c [COLLECTION] -r [RECORD_TYPE] -h [HOST] -p [PORT] | (streamed output)

- d: name of the Mongo database that contains the records collection
- c: name of the Mongo collection that containes the record documents
- r: type of the records to decompile (default="ocds")
- h: Mongo host (default="localhost")
- p: Mongo port (default="27017")

## Input

This decompiler receives as input a list of strings, one per line, containing unique identifiers for all records in the Mongo collection that you wish to decompile.

The list of strings is then streamed through a pipe into the script:

    cat file.txt | (record-decompiler)

## Output

The script outputs JSON documents, one per line, containing a flattened representation of the records structure. This representation depends on the record type passed in as an argument. Record types can be added as a file inside the **lib/record_types/** directory with the format *typeRecord.js* (for example, OCDS records are processed through the ocdsRecord.js file).

## Record Types

To implement a new record type, create the file described above with the following 2 functions inside:

- function recordDecompiler(id, record): receives the current line being processed as *id* and the record retrieved from Mongo as *record*. Returns the flattened structure.
- function getIDFieldName(): returns the field that should be used to match the identifiers in the input file.

The implementation of the recordDecompiler function is up to you. In general, the following rules are observed to flatten a Javascript object:

- Iterate over the object's properties.
- If the property is a nested object, recurse.
- If the property is a value (number, string, date, etc.) copy it.
- If the property is an array:
    - If the array has a single element, convert into an object.
    - If the array has more than one element:
        - If the elements are objects, convert array into indexed object (array.0, array.1, etc.)
        - If the elements are values, copy the array as is.

## Streaming the output

Use a tool such as [stream2db](http://gitlab.rindecuentas.org/equipo-qqw/stream2db/) to stream the decompiled values into Mongo or ElasticSearch.
