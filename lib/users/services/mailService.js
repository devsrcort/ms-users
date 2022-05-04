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



function sendMail(api_base, address, jwt) {
    const template = `
    <html>
    <head>
    </head>
    <body>
        <p>SRT 웹지갑 계정의 비밀번호를 바꾸기 위해서 아래 비밀번호 변경하기를 클릭하시기 바랍니다.</p>
        <br>
        <a href="https://${api_base}/users/updatePasswdByMail?token=${jwt}">비밀번호 변경하기</a>
    </body>
    </html>
    `;

    const params = {
        Destination: {
            /* required */
            ToAddresses: [
                address,
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
                Data: "SRT Web wallet 비밀번호 변경",
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

module.exports = sendMail;