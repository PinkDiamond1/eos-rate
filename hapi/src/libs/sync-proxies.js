#!/usr/bin/env node
const { JsonRpc } = require('eosjs')
const EosApi = require('eosjs-api')
const fetch = require('node-fetch')
const massive = require('massive')
const { massiveConfig } = require('../config')

const HAPI_EOS_API_ENDPOINT = process.env.HAPI_EOS_API_ENDPOINT || 'https://jungle.eosio.cr'
const HAPI_PROXY_CONTRACT = process.env.HAPI_PROXY_CONTRACT || 'proxyaccount'


const getProxiesData = async () => {
  const db = await massive(massiveConfig)
  const eos = new JsonRpc(HAPI_EOS_API_ENDPOINT, { fetch })
  const eosApi = EosApi({
    httpEndpoint: HAPI_EOS_API_ENDPOINT,
    verbose: false
  })

  const { rows: proxies } = await eos.get_table_rows({
    json: true,
    code: HAPI_PROXY_CONTRACT,
    scope: HAPI_PROXY_CONTRACT,
    table: 'proxies',
    limit: 1000,
    reverse: false,
    show_payer: false
  })

  proxies.forEach(async (proxy) => {
    const account = await eosApi.getAccount({ account_name: proxy.owner })

    if (account && account.voter_info && account.voter_info.is_proxy) {
      proxy.voter_info = account.voter_info
      try {
        const resultProxySave = await db.proxies.save(proxy)
        const dbResult = resultProxySave ? resultProxySave : await db.proxies.insert(proxy)
        console.log(`Save or insert of ${proxy.owner} was ${dbResult ? 'SUCCESSFULLY' : 'UNSUCCESSFULLY'}`)
      } catch (err) { console.log(`Error: ${err}`) }
    } else console.log(`${proxy.owner} is not a proxy`)
  })
}

getProxiesData()
