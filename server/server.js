require("dotenv").config();

const express = require("express");
const cors = require("cors");

const SibApiV3Sdk =
  require("sib-api-v3-sdk");

const app = express();

app.use(cors());

app.use(express.json());

const client =
  SibApiV3Sdk.ApiClient
    .instance;

const apiKey =
  client.authentications["api-key"];

apiKey.apiKey =
  process.env.BREVO_API_KEY;

const tranEmailApi =
  new SibApiV3Sdk.TransactionalEmailsApi();

app.post(
  "/send-order-email",
  async (req, res) => {

    try {

      const {
        customer_name,
        customer_email,
        order_status,
        tracking_id,
      } = req.body;

      await tranEmailApi.sendTransacEmail({

        sender: {

          email:
            "hello.zyvar@gmail.com",

          name:
            "ZYVAR",
        },

        to: [
          {
            email:
              customer_email,
          },
        ],

        subject:
          `ZYVAR Order ${order_status}`,

        htmlContent: `

          <div style="font-family:sans-serif;padding:20px">

            <h2>
              Hello ${customer_name}
            </h2>

            <p>
              Your order status is now:
            </p>

            <h1>
              ${order_status}
            </h1>

            <p>
              Tracking ID:
              ${tracking_id}
            </p>

            <br/>

            <p>
              Thank you for shopping with ZYVAR.
            </p>

          </div>
        `,
      });

      res.status(200).json({
        success: true,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.listen(
  process.env.PORT || 5000,
  () => {

    console.log(
      "Server running"
    );
  }
);