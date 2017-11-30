import axios from "axios";

const generateTitle = ({ connector, trigger }) => connector.contract
  ? `[${connector.contract.chain}] Ethereum Event: ${connector.eventName} on ${connector.contract.name}`
  : (connector.chain
    ? `[${connector.chain}] Ethereum transaction: ${connector.address}`
    : `Event`);

const fields = ({ transaction, payload }) => [
  ...Object.keys(transaction)
    .filter((x) => [null, undefined, ""].indexOf(transaction[x]) < 0)
    .map((x) => ({ title: x, value: transaction[x] })),
  Object.keys(payload).length
    ? { title: "payload", value: JSON.stringify(payload, null, 2) }
    : null,
].filter((x) => x);

export default ({ trigger, connector, meta, url, payload, transaction }) => axios({
  data: {
    attachments: [
      {
        author_icon: "https://emoji.slack-edge.com/T4K5WCG3G/etherstellar/35d06f3418760665.png",
        author_link: url,
        author_name: "EtherStellar",
        color: "#004f94",
        fallback: generateTitle({ connector, trigger }),
        fields: fields({ transaction, payload }),
        footer: "EtherStellar",
        footer_icon: "https://emoji.slack-edge.com/T4K5WCG3G/etherstellar/35d06f3418760665.png",
        // image_url: "http://my-website.com/path/to/image.jpg",
        // pretext: "Optional text that appears above the attachment block",
        // thumb_url: "http://example.com/path/to/thumb.png",
        title: generateTitle({ connector, trigger }),
        // title_link: "https://api.slack.com/",
        ts: +new Date() / 1000,
      },
    ],
    icon_emoji: ":chains:",
    text: "",
    username: "EtherStellar",
  },
  method: "POST",
  url: meta.webhookUrl,
})
  .then(({ data }) => data);
