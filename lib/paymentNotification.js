const crypto = require('crypto');
const prisma = require('@prisma/client').PrismaClient; // Assuming you're using Prisma

const PaymentNotification = async (req, res) => {
  const payload = req.body;
  const payvessel_signature = req.header('HTTP_PAYVESSEL_HTTP_SIGNATURE');
  const ip_address = req.connection.remoteAddress;
  const secret = process.env.PAYVESSEL_SECRET;

  const hash = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  const allowedIPs = ["3.255.23.38", "162.246.254.36"];

  if (payvessel_signature === hash && allowedIPs.includes(ip_address)) {
    try {
      const { order, transaction } = payload;
      const { amount, settlement_amount, fee, description } = order;
      const reference = transaction.reference;

      // Check if the reference already exists in your database
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference },
      });

      if (existingTransaction) {
        return res.status(200).json({ message: 'Transaction already exists' });
      }

      // Process payment: Fund user wallet or update transaction table
      await prisma.transaction.create({
        data: {
          reference,
          amount,
          settlementAmount: settlement_amount,
          fee,
          description,
          status: 'completed', // Mark as completed
        },
      });

      // Optionally, fund the user's wallet
      // Update the user's account balance
      const userId = transaction.user_id; // Assuming the transaction includes user_id
      await prisma.user.update({
        where: { id: userId },
        data: {
          accountBalance: { increment: parseFloat(settlement_amount) },
        },
      });

      res.status(200).json({ message: 'Success' });
    } catch (error) {
      console.error('Error processing payment notification:', error);
      res.status(500).json({ message: 'Error processing payment' });
    }
  } else {
    res.status(400).json({ message: 'Permission denied: invalid hash or IP address.' });
  }
};

module.exports = { PaymentNotification };
