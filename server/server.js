const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const app = express();

app.use(cors());

app.use(express.json());

/* =========================================
   ROOT
========================================= */

app.get("/", (req, res) => {

  res.send("ZYVAR Email Server Running");

});

/* =========================================
   BREVO EMAIL FUNCTION
========================================= */

const sendBrevoEmail = async ({
  to,
  templateId,
  params,
}) => {

  try {

    const response =
      await axios.post(

        "https://api.brevo.com/v3/smtp/email",

        {
          to: [
            {
              email: to,
            },
          ],

          templateId,

          params,
        },

        {
          headers: {

            "api-key":
              process.env.BREVO_API_KEY,

            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      "Brevo Email Sent:",
      response.data
    );

    return response.data;

  } catch (error) {

    console.log(
      "Brevo Error:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
};

/* =========================================
   EMAIL VERIFICATION
========================================= */

app.post(
  "/send-verification-email",

  async (req, res) => {

    try {

      const {
        email,
        name,
        verificationLink,
      } = req.body;

      await sendBrevoEmail({

        to: email,

        templateId: 1,

        params: {

          USER_NAME:
            name ||

            "Customer",

          VERIFY_LINK:
            verificationLink,
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Verification email sent successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send verification email",
      });
    }
  }
);

/* =========================================
   CUSTOM VERIFY EMAIL
========================================= */

app.post(
  "/send-custom-verification",

  async (req, res) => {

    try {

      const {
        email,
        name,
      } = req.body;

      const verificationLink =
        await admin
          .auth()
          .generateEmailVerificationLink(
            email,
            {
              url:
                process.env.FRONTEND_URL +
                "/login",
            }
          );

      await sendBrevoEmail({

        to: email,

        templateId: 1,

        params: {

          USER_NAME:
            name ||

            "Customer",

          VERIFY_LINK:
            verificationLink,
        },
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

/* =========================================
   RESET PASSWORD EMAIL
========================================= */

app.post(
  "/send-reset-password-email",

  async (req, res) => {

    try {

      const {
        email,
        name,
        resetLink,
      } = req.body;

      await sendBrevoEmail({

        to: email,

        templateId: 2,

        params: {

          USER_NAME:
            name ||

            "Customer",

          RESET_LINK:
            resetLink,
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Password reset email sent successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send reset password email",
      });
    }
  }
);

/* =========================================
   CUSTOM RESET PASSWORD
========================================= */

app.post(
  "/send-custom-reset",

  async (req, res) => {

    try {

      const {
        email,
        name,
      } = req.body;

      const resetLink =
        await admin
          .auth()
          .generatePasswordResetLink(
            email,
            {
              url:
                process.env.FRONTEND_URL +
                "/login",
            }
          );

      await sendBrevoEmail({

        to: email,

        templateId: 2,

        params: {

          USER_NAME:
            name ||

            "Customer",

          RESET_LINK:
            resetLink,
        },
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

/* =========================================
   ORDER CONFIRMED
========================================= */

app.post(
  "/send-order-confirmed-email",

  async (req, res) => {

    try {

      const {
        order,
      } = req.body;

      await sendBrevoEmail({

        to: order.email,

        templateId: 3,

        params: {

          CUSTOMER_NAME:
            order.name,

          ORDER_ID:
            order.id,

          PRODUCT_NAME:
            order.items?.[0]?.name ||

            "ZYVAR Product",

          PRODUCT_IMAGE:
            order.items?.[0]?.image ||

            "",

          TOTAL:
            order.total ||

            0,

          PAYMENT_STATUS:
            order.paymentStatus ||

            "Pending",

          TRACKING_LINK:
            "https://zyvar.vercel.app/my-orders",
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Order confirmed email sent",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send order confirmed email",
      });
    }
  }
);

/* =========================================
   SHIPPING UPDATE
========================================= */

app.post(
  "/send-shipping-email",

  async (req, res) => {

    try {

      const {
        order,
      } = req.body;

      await sendBrevoEmail({

        to: order.email,

        templateId: 4,

        params: {

          CUSTOMER_NAME:
            order.name,

          ORDER_ID:
            order.id,

          PRODUCT_NAME:
            order.items?.[0]?.name ||

            "ZYVAR Product",

          PRODUCT_IMAGE:
            order.items?.[0]?.image ||

            "",

          TOTAL:
            order.total ||

            0,

          PAYMENT_STATUS:
            order.paymentStatus ||

            "Pending",

          TRACKING_LINK:
            "https://zyvar.vercel.app/my-orders",
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Shipping update email sent",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send shipping email",
      });
    }
  }
);

/* =========================================
   DELIVERED UPDATE
========================================= */

app.post(
  "/send-delivered-email",

  async (req, res) => {

    try {

      const {
        order,
      } = req.body;

      await sendBrevoEmail({

        to: order.email,

        templateId: 5,

        params: {

          CUSTOMER_NAME:
            order.name,

          ORDER_ID:
            order.id,

          PRODUCT_NAME:
            order.items?.[0]?.name ||

            "ZYVAR Product",

          PRODUCT_IMAGE:
            order.items?.[0]?.image ||

            "",

          TOTAL:
            order.total ||

            0,

          PAYMENT_STATUS:
            order.paymentStatus ||

            "Paid",

          TRACKING_LINK:
            "https://zyvar.vercel.app/my-orders",
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Delivered email sent",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send delivered email",
      });
    }
  }
);

/* =========================================
   NEWSLETTER EMAIL
========================================= */

app.post(
  "/send-newsletter-email",

  async (req, res) => {

    try {

      const {
        email,
      } = req.body;

      await sendBrevoEmail({

        to: email,

        templateId: 6,

        params: {

          EMAIL:
            email,
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Newsletter email sent",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send newsletter email",
      });
    }
  }
);

/* =========================================
   PRODUCT REQUEST COMPLETED
========================================= */

app.post(
  "/send-product-request-email",

  async (req, res) => {

    try {

      const {
        request,
      } = req.body;

      await sendBrevoEmail({

        to: request.email,

        templateId: 7,

        params: {

          CUSTOMER_NAME:
            request.name ||

            "Customer",

          PRODUCT_NAME:
            request.productName ||

            "Requested Product",

          PRODUCTS_LINK:
            "https://zyvar.vercel.app/products",
        },
      });

      res.status(200).json({

        success: true,

        message:
          "Product request email sent",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to send product request email",
      });
    }
  }
);

/* =========================================
   SERVER
========================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `ZYVAR Server Running On Port ${PORT}`
  );

});