import Vault from '@zippie/vault-api'
import * as vaultWeb3 from '@zippie/vault-web3-provider'
import Box from '3box'
import { div, h1, span, br } from 'callbag-html'

const vault = new Vault()
let box = null
let address = null

async function setup() {
    await vault.setup()
    const options = { signup_no_recovery: true };
    await vault.signin(options, true)

    const ethereum = vaultWeb3.init(vault, {network: 'kovan'})

    address = await vaultWeb3.addAccount('m/0')
    console.log('address', address)

    const profile = await Box.getProfile(address)
    displayMessage(JSON.stringify(profile))

    box = await Box.openBox(address, ethereum)
    box.onSyncDone(_ => {
        displayMessage("syncDone")
    })

    console.log('box open', box)
}

async function startSpace() {
    const space = await box.openSpace('zippie-3box')

    const thread = await space.joinThread('welcome')

    const posts = await thread.getPosts()
    posts.forEach(post => {
        displayMessage(JSON.stringify(post))
    })

    thread.post('Hello - ' + address)

    thread.onNewPost(post => {
        displayMessage(JSON.stringify(post))
    })
}

function displayMessage(message)
{
  console.log(message)
  document.body.appendChild(
    div([span(message),
    br()
    ])
  )
}


setup().then(_ => {
    startSpace()
})