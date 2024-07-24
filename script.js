 const resetPassword = async (req, res) => {
    try {
      // Find the user by email or phone number
      const user = await user.findOne({ $or: [{ email: req.body.emailOrPhone }, { phone: req.body.emailOrPhone }] });
      // If user not found, send error message
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      // Generate a unique JWT token for the user that contains the user's id
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10m" });
      // Send the token to the user's email or phone number
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD_APP_EMAIL,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.emailOrPhone,
        subject: "Reset Password",
        html: `<h1>Reset Your Password</h1>
                <p>Click on the following link to reset your password:</p>
                <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
                <p>The link will expire in 10 minutes.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send({ message: "Error sending email" });
        }
        res.send({ message: "Email sent successfully" });
      });
    } catch (err) {
      res.status(500).send({ message: "Error resetting password" });
    }
  };