import Vault from '@zippie/vault-api'
import { div, h1, span, br, button } from 'callbag-html'

import * as IPFS from "ipfs"
import * as OrbitDB from "orbit-db"
import {ZippieIdentity} from './zippie-identity-provider'
import Identities from 'orbit-db-identity-provider'
import OrbitDBAddress from "orbit-db/src/orbit-db-address"


const vault = new Vault()
let box = null
let id = null

const ipfsConfig = {
    repo: "/zippie/example",
    EXPERIMENTAL: {
      pubsub: true
    },
    start: true,
    preload: { 
      enabled: false
    },
    config: {
      Addresses: {
        Swarm: [
          // Use IPFS dev signal server
          "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
        ]
      }
    }
  };

  const dbConfig = {
    // If database doesn't exist, create it
    create: true,
    // Don't wait to load from the network
    sync: false,
    // Load only the local version of the database
    localOnly: false,
    // Allow anyone to write to the database,
    // otherwise only the creator of the database can write
    accessController: {
      write: ['*']
    }
  };

  const ipfs = new IPFS(ipfsConfig);
  let orbitdb = null
  let db = null

  ipfs.on('ready', setup)

async function setup() {
    console.log("--- SETUP ---")
    await vault.setup()
    const options = { signup_no_recovery: true };
    await vault.signin(options, true)


    Identities.addIdentityProvider(ZippieIdentity)
    const identity = await Identities.createIdentity({ type: 'ZippieIdentity', vault})

    id = identity.id

    const orbitOptions = {
        identity: identity
    }

    orbitdb = await OrbitDB.createInstance(ipfs, orbitOptions)
    console.log(orbitdb)

    const params = window.location.hash.split('/')

    if(params.length == 3) {

      console.log({root: params[1], path: params[2]})

      let address = new OrbitDBAddress(params[1], params[2])

      db = await orbitdb.eventlog(address, dbConfig)

    } else {
      db = await orbitdb.eventlog("zippie-test", dbConfig);
      console.log(db)

      window.location.hash = '/' + db.address.root + '/' + db.address.path
    }


    startSpace()
}

async function startSpace() {

  db.events.on('ready', () => {
    const items = db.iterator().collect()
    items.forEach((e) => displayMessage(JSON.stringify(e)))
  })

    db.events.on('write', () => {
        const items = db.iterator().collect()
        items.forEach((e) => displayMessage(JSON.stringify(e)))
      })

    db.events.on('replicated', () => {
      const items = db.iterator().collect()
      items.forEach((e) => displayMessage(JSON.stringify(e)))
    })
    await db.load()

    let hash = await db.add({hello: id})
    console.log(hash)
}

async function onClick() {
  let hash = await db.add({hello: id})
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

document.body.appendChild(button(onClick, 'Send'))