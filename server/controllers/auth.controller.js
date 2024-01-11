const bcrypt = require("bcrypt");
const User = require("../Models/FormatChecks.js");
const ErrorHandling = require("./Error");
const db = require("../Database/index");
const catchAsync=require("./catchAsync.js");




 exports.signup=catchAsync ( async (req, res, next) => {
    // Validate the request body against the sign up schema
    function generateRandomString(length) {
      return Math.random().toString(36).substring(2, 2 + length);
    }
    
    // Example: Generate a random string of length 8
    const randomString = generateRandomString(10);
    const {
      FName,
      MName,
      LName,
      Email,
      Username,
      Telephone,
      Password,
      ConfirmPassword,
    } = req.body;

    if (
      !FName ||
      !LName ||
      !MName ||
      !Email ||
      !Password ||
      !Username ||
      !Telephone ||
      !ConfirmPassword
    ) {
      return next(new ErrorHandling("Fill All Fields!", 409));
    }

    if (!User.phoneCheck(Telephone)) {
      return next(new ErrorHandling("Invalid Phone number!", 400));
    }
    if (!User.checkEmail(Email)) {
      return next(new ErrorHandling("Email is invalid", 400));
    }
    const hashedPassword = await User.hashPassword(Password);
    if (hashedPassword == -1)
      return next(new ErrorHandling("Something is Wrong!!", 500));
    const newUser =
      await db.query(`INSERT INTO client Values(DEFAULT,'${Email}', '${Username}',
        '${Telephone}','${randomString}', '${FName}', '${MName}',' ${LName}', '${hashedPassword}','5',7,null)RETURNING ID,invitation_code;`);

         res.status(200).send({status:"success",SignUp_Retrivals:newUser.rows[0]});

  });

  exports.login=catchAsync (async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return next(new ErrorHandling("Please enter Email & password", 400));
    }
 
    if (!User.checkEmail(email)) {
      return next(new ErrorHandling("Incorrect email or password", 401));
    }
  
    const user = await db.query(
      `SELECT password FROM client WHERE email = '${email}';`
    );

    const newUserId = await db.query(
      `SELECT id FROM client WHERE email = '${email}';`
    );
    const truePassword = user["rows"][0]["password"] + "";
   
    const correct = await User.checkPassword(password, truePassword);
    if (correct == -1)
      return next(new ErrorHandling("some thing went wrong try again", 500));
    
    if (user["rowCount"] == 0 || !correct) {
      return next(new ErrorHandling("incorrect email or password", 401));
    }
    const result = await db.query(`SELECT * FROM client where Email='${email}';`);
    res.status(200).send({status:"Successfully Logged in",user_info:result.rows[0]});
  });





