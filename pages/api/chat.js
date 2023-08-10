// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';

import { HttpsProxyAgent } from 'https-proxy-agent';

export default async function handler(req, res) {
  const referer = req.headers.referer || req.headers.referrer; // get the referer from the request headers

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method should be POST' });
  } else if (process.env.NODE_ENV !== "development") {
    if (!referer || referer !== process.env.APP_URL) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
  else {
    try {
      const { body } = req;
      const url = 'https://api.openai.com/v1/chat/completions';
      const headers = {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      };

      // let agent = new HttpsProxyAgent('http://127.0.0.1:10809');

      const response = await axios.post(url, body, {
        headers: headers,
        // httpsAgent: agent
      })

      res.status(200).json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

}
