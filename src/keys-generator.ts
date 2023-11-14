import { generateKeyPairSync } from "crypto";

const keyPairs = generateKeyPairSync('dsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'der'
    },
    privateKeyEncoding: {
        type: 'pcks1',
        format: 'pem'
    }
})