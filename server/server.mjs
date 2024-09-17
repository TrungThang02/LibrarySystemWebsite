import nodemailer from 'nodemailer';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3002;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { recipient, subject, html } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'trantrungthang01699516993@gmail.com', 
            pass: 'iauopfthcsrhnunj' 
        }
    });

    const mailOptions = {
        from: '"Hệ thống Quản lý Tiêm Chủng" <trantrungthang01699516993@gmail.com>', 
        to: recipient,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
