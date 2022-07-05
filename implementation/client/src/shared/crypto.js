function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
};

export const generateRSAKeyPair = async (privateKeyPassword) => {
    const keyPair = await window.crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
    },
        true,
        ["encrypt", "decrypt"]
    );

    const rawKey = str2ab(privateKeyPassword);
    const symmetricKey = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey"]);
    const privateKey = await window.crypto.subtle.wrapKey("pkcs8", keyPair.privateKey, symmetricKey, { name: "AES-GCM", iv: new Uint8Array(12) });

    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);

    return [privateKey, publicKey];
};

export const generateSecurePassword = () => {
    // TODO use real key
    return "1234123412341234";
};

export const decryptPrivateKey = async (privateKey, privateKeyPassword) => {
    const rawKey = str2ab(privateKeyPassword);
    const symmetricKey = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    const uncPrivateKey = await window.crypto.subtle.unwrapKey("pkcs8", privateKey, symmetricKey, { name: "AES-GCM", iv: new Uint8Array(12) }, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
    const exportedKey = await window.crypto.subtle.exportKey("pkcs8", uncPrivateKey);
    return arrayBufferToBase64(exportedKey);
};
