function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export const ab2str = (ab) => {
    var enc = new TextDecoder("utf-8");
    return enc.decode(ab);
}

export const arrayBufferToBase64 = (arrayBuffer) => {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for (var i = 0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

export const base64ToArrayBuffer = (b64) => {
    var byteString = window.atob(b64);

    var byteArray = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
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
    const base64publicKey = arrayBufferToBase64(publicKey);

    return [privateKey, base64publicKey];
};

export const generateSecurePassword = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (var i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    
    return result;
};

export const decryptPrivateKey = async (privateKey, privateKeyPassword) => {
    const rawKey = str2ab(privateKeyPassword);
    const symmetricKey = await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["wrapKey", "unwrapKey"]);
    const uncPrivateKey = await window.crypto.subtle.unwrapKey("pkcs8", privateKey, symmetricKey, { name: "AES-GCM", iv: new Uint8Array(12) }, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
    const exportedKey = await window.crypto.subtle.exportKey("pkcs8", uncPrivateKey);
    return arrayBufferToBase64(exportedKey);
};

export const decryptWithPrivateKey = async (encodedPrivateKey, encryptedBytes) => {
    const privateKey = await window.crypto.subtle.importKey("pkcs8", base64ToArrayBuffer(encodedPrivateKey), { name: "RSA-OAEP", hash: "SHA-256" }, false, ['decrypt']);
    const decryptedBytes = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBytes);
    return decryptedBytes;
};

export const encryptWithPublicKey = async (encodedPublicKey, content) => {
    const publicKey = await window.crypto.subtle.importKey("spki", base64ToArrayBuffer(encodedPublicKey), { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
    const encryptedBytes = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, content);
    return encryptedBytes;
}

export const generateSymmetricKey = async () => {
    return crypto.subtle.generateKey({
        "name": "AES-GCM",
        "length": 256
    }, true, ['encrypt', 'decrypt']);
}

export const exportSymmetricKey = async (key) => {
    return crypto.subtle.exportKey('raw', key);
}

export const importSymmetricKey = async (key) => {
    return crypto.subtle.importKey('raw', key, { "name": "AES-GCM" }, false, ['encrypt', 'decrypt']);
}

export const symmetricEncrypt = async (content, key) => {
    return crypto.subtle.encrypt({ "name": "AES-GCM", "iv": new Uint8Array(12) }, key, content);
}

export const symmetricDecrypt = async (content, key) => {
    return crypto.subtle.decrypt({ "name": "AES-GCM", "iv": new Uint8Array(12) }, key, content);
}