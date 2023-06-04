const AWS = require("aws-sdk");
const log = require("metalogger")();

AWS.config.update({ region: "ap-northeast-2" });

// Create the promise and SES service object
const verifyDomainPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .verifyDomainIdentity({ Domain: "srt-wallet.io" })
    .promise();

// Handle promise's fulfilled/rejected states
verifyDomainPromise
    .then(function(data) {
        log.info("Verification Token: " + data.VerificationToken);
    })
    .catch(function(err) {
        log.info(err, err.stack);
    });



function sendMailForUserInfo(userName, email, address, message) {

    const template = `
    <html>
    <head>
    </head>
    <body>
        <p>SRT Additional withdraw information</p><br>
        <br>
        <p>UserName : ${userName} <br></p>
        <p>Email : ${email} <br></p>
        <p>Address : ${address} <br></p>
        <p>Message : ${message} <br></p>
    </body>
    </html>
    `;

    const params = {
        Destination: {
            /* required */
            ToAddresses: [
                'srtwithdraw@gmail.com',
                /* more items */
            ],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: template,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "SRT Web wallet 추가 출금",
            },
        },
        Source: "noreplay@srt-wallet.io",
        /* required */
        ReplyToAddresses: [
            "noreplay@srt-wallet.io",
            /* more items */
        ],
    };

    // Create the promise and SES service object
    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail(params)
        .promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
        .then(function(data) {
            log.info(data.MessageId);
        })
        .catch(function(err) {
            log.info(err, err.stack);
        });

    return;
}

module.exports = sendMailForUserInfo;