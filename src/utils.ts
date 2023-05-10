import { ByteArray, Bytes, log, crypto } from '@graphprotocol/graph-ts'

export function namehash(buf: Bytes): Bytes {
    let offset = 0;
    let hashlength = 64;
    let list = new ByteArray(0);
    let reverseList = new ByteArray(0);
    let dot = Bytes.fromHexString("2e");
    let len = buf[offset++];
    let hex = buf.toHexString();
    let nodehash = '0000000000000000000000000000000000000000000000000000000000000000'
    let n = 0
    while (len) {
        n = n + 1
        let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
        let labelBytes = Bytes.fromHexString(label);
        if (offset > 1) {
            list = concat(list, dot);
        }
        list = concat(list, labelBytes);
        let labelhash = crypto.keccak256(labelBytes);
        reverseList = concat(labelhash, reverseList);
        offset += len;
        len = buf[offset++];
    }
    let j = 0
    let offset2 = 2;
    while(j < n){
        j = j + 1

        let l = reverseList.toHexString().slice(offset2, offset2 + hashlength);
        nodehash = makeSubnode(Bytes.fromHexString(nodehash), Bytes.fromHexString(l));
        offset2 = offset2 + hashlength;    
    }
    return Bytes.fromHexString(nodehash);
}

export function decodeName(buf: Bytes): Array<string> | null {
    let offset = 0;
    let list = new ByteArray(0);
    let parent = new ByteArray(0);
    let dot = Bytes.fromHexString("2e");
    let len = buf[offset++];
    let hex = buf.toHexString();
    let firstLabel = "";
    let parentNode = "";
    if (len === 0) {
        return [firstLabel, "."];
    }
    let i = 0;
    while (len) {
        i = i +1;
        let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
        if(parentNode == ""){
            parentNode = hex.slice((offset + 1 + len) * 2);
        }
        let labelBytes = Bytes.fromHexString(label);
        if (!checkValidLabel(labelBytes.toString())) {
            return null;
        }

        if (offset > 1) {
            if(parent.toString() != ''){
                parent = concat(parent, dot);
            }
            list = concat(list, dot);
        } else {
            firstLabel = labelBytes.toString();
        }
        list = concat(list, labelBytes);
        if(labelBytes.toString() != firstLabel.toString()){
            parent = concat(parent, labelBytes);
        }
        offset += len;
        len = buf[offset++];
    }
    return [firstLabel, list.toString(), parent.toString(), parentNode.toString()];
}

export function byteArrayFromHex(s: string): ByteArray {
    if(s.length % 2 !== 0) {
        throw new TypeError("Hex string must have an even number of characters")
    }
    let out = new Uint8Array(s.length / 2)
    for(var i = 0; i < s.length; i += 2) {
        out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32
    }
    return changetype<ByteArray>(out)
}

export function encodeHex(data: string): string {
    const array = Uint8Array.wrap(String.UTF8.encode(data))
    let hex = ''
    for (let i = 0; i < array.length; i++) {
        hex += array[i].toString(16)
    }
    return hex
}


function makeSubnode(node: Bytes, label: Bytes): string {
    return crypto.keccak256(concat(node, label)).toHexString()
}

export function concat(a: ByteArray, b: ByteArray): ByteArray {
    let out = new Uint8Array(a.length + b.length);
    for (let i = 0; i < a.length; i++) {
      out[i] = a[i];
    }
    for (let j = 0; j < b.length; j++) {
      out[a.length + j] = b[j];
    }
    return changetype<ByteArray>(out);
}
    
export function checkValidLabel(name: string): boolean {
    for (let i = 0; i < name.length; i++) {
        let c = name.charCodeAt(i);
        if (c === 0) {
            log.warning("Invalid label '{}' contained null byte. Skipping.", [name]);
            return false;
        } else if (c === 46) {
            log.warning(
                "Invalid label '{}' contained separator char '.'. Skipping.",
                [name]
            );
            return false;
        }
    }
    return true;
}