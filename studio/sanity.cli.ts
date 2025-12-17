import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'opo1mysf',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
  },
})
