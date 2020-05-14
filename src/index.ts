import { token, owners } from './config'
import Client from './client/client'

const client: Client = new Client({ token, owners })
client.start()
