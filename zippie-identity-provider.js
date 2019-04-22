
import IdentityProvider from 'orbit-db-identity-provider/src/identity-provider-interface.js'
import * as shajs from 'sha.js'

export class ZippieIdentity extends IdentityProvider {

    constructor(options) {
        super()
        this.vault = options.vault
    }

    static get type () { return 'ZippieIdentity' } // return type
    async getId () {
        const keyInfo = await this.vault.secp256k1.keyInfo("m/1")
        console.log(keyInfo)
        return keyInfo.pubkey
     } // return identifier of external id (eg. a public key)
    async signIdentity (data) {
        console.log("--- SIGN ---", data)


        const hash = shajs('sha256').update(data).digest()

        const sign = await this.vault.secp256k1.sign("m/1", hash)
        console.log(sign)
        return sign.signature
     } 
    static async verifyIdentity (identity) { return true } //return true if identity.sigantures are valid
}