import axios from 'axios';

const generateTitle = ({ connector, trigger }) => connector.contract
  ? `[${connector.contract.chain}] Ethereum Event: ${connector.eventName} on ${connector.contract.name}`
  : `[${connector.chain}] Ethereum transaction: ${connector.address}`

const fields = ({ transaction, payload }) => [
  ...Object.keys(transaction).map(x => ({ title: x, value: transaction[x] })),
  Object.keys(payload).length
    ? { title: 'payload', value: JSON.stringify(payload) }
    : null
].filter(x => x)

export default ({ trigger, connector, meta, url, payload, transaction }) => axios({
  method: 'POST',
  url: meta.webhookUrl,
  data: {
    username: 'EtherStellar',
    text: '',
    icon_emoji: ':chains:',
    attachments: [
      {
        fallback: generateTitle({ connector, trigger }),
        color: '#004f94',
        // pretext: "Optional text that appears above the attachment block",
        author_name: 'EtherStellar',
        author_link: url,
        author_icon: 'https://emoji.slack-edge.com/T4K5WCG3G/etherstellar/35d06f3418760665.png',
        title: generateTitle({ connector, trigger }),
        // title_link: "https://api.slack.com/",
        fields: fields({ transaction, payload }),
        // image_url: 'http://my-website.com/path/to/image.jpg',
        // thumb_url: 'http://example.com/path/to/thumb.png',
        footer: 'EtherStellar',
        footer_icon: 'https://emoji.slack-edge.com/T4K5WCG3G/etherstellar/35d06f3418760665.png',
        ts: +new Date() / 1000
      }
    ]
  }
})
  .then(({ data }) => data)
