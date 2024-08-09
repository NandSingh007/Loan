const jwt = require("jsonwebtoken");
// import jwt from "jsonwebtoken";
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const formidable = require("formidable");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const userloginDatas = require("../../models/LofinUserDetail");
const {
  Types: { ObjectId }
} = require("mongoose");
const Admin_User = require("../../models/UserData");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
// const { JustCheck, ImgModel } = require("../../models/Justcheck");
const {
  ImgCollectiondata,
  NoticeCollectiondata
} = require("../../models/ImagesColletion");
const PackageData = require("../../models/PackageLoan");
const CompanyProfile = require("../../models/CompanyProfileSchema");
const LoginData = require("../../models/LoginModule");
const StepFormData = require("../../models/UserFormDetails");
// const jobDetails = require("../../models/JobDetails");
const JoDocuments = require("../../models/Stem3Form");
const LoanTypeDatas = require("../../models/LoanType");
const Step4Details = require("../../models/Step4Details");
const processingFeeData = require("../../models/ProcessingFee");
const SecurityData = require("../../models/secuirty");
const jobDetails = require("../../models/JobDetails");
const User = require("../../models/User");
const Registration = require("../../models/Registration");
const FileUpload = require("../../models/FileUpload");

dotenv.config();

exports.sendotp = async (req, res, next) => {
  try {
    let { userphone, userotp } = req.body;
    console.log(userphone, userotp, " userphone, userotp ");

    // Convert the phone number and OTP to numbers
    userphone = Number(userphone);
    userotp = Number(userotp);

    console.log(typeof userphone, userphone, "Converted userphone");
    console.log(typeof userotp, userotp, "Converted userotp");
    const response = await axios.get(
      `https://sms.bulksmslab.com/SMSApi/send?userid=gamezone&password=Royal@12&sendMethod=quick&mobile=${userphone}&msg=Your+OTP+is${userotp}for+Phone+Verification.OTPSTE&senderid=OTPSTE&msgType=text&duplicatecheck=true&output=json`
    );

    console.log("SMS API Response:", response.data);

    res.json(response.data);
  } catch (error) {
    console.error("Error sending OTP:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request data:", error.request);
      res.status(500).json({ error: "No response received from SMS API" });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      res.status(500).json({ error: "Server error" });
    }
  }
};
exports.updateotp = async (req, res) => {
  try {
    const { id, otp, number } = req.body;
    // Find the user in the database
    const user = await LoginData.findOne({ _id: id, number: number });

    if (user) {
      // Update the user's OTP
      user.otp = otp;
      await user.save();

      // Generate a new token with only the userId
      const token = jwt.sign({ userId: user._id }, "j", {
        expiresIn: "30d"
      });

      // Send the new token in the response
      return res.status(200).json({ token });
    } else {
      // If the user does not exist, send a response accordingly
      return res
        .status(404)
        .json({ message: "User not found or OTP is incorrect" });
    }
  } catch (error) {
    console.error("Error in /update-otp:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.loginNumber = async (req, res) => {
  try {
    const { number, otp } = req.body;
    if (!number) {
      return res.status(400).json({ message: "User number is required" });
    }

    let user = await LoginData.findOne({ number: number });

    if (!user) {
      user = new LoginData({ number: number, otp: otp });
      await user.save();
    }

    // Generate a token that expires in 1 month
    const token = jwt.sign(
      { number: user.number, otp: user.otp, id: user._id },
      "j",
      {
        expiresIn: "30d"
      }
    );

    // Send the response with the token
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error in loginNumber:", error.message, error.stack);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.LoanTypes = async (req, res) => {
  try {
    const { loanType, interest, limit } = req.body;
    if (!loanType || !interest || !limit) {
      return res
        .status(400)
        .json({ message: "Loan Type, Interest, and Limit are required" });
    }
    const newLoan = new LoanTypeDatas({
      loanType,
      interest,
      limit
    });

    await newLoan.save();
    return res
      .status(200)
      .json({ message: "Loan added successfully", loan: newLoan });
  } catch (error) {
    console.error("Error adding loan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanTypeDatas.find(); // Adjust this query according to your database and schema
    res.status(200).json(loanTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch loan types", error: error.message });
  }
};

const fetchJobDetails = async (id) => {
  try {
    const jobDetails = await jobDetails.find({ userId: id });
    return jobDetails || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchJoDocuments = async (id) => {
  try {
    const joDocuments = await JoDocuments.find({ userId: id });
    return joDocuments || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchStepFormData = async (id) => {
  try {
    const stepFormData = await StepFormData.find({ userId: id });
    console.log(stepFormData);
    return stepFormData || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

const fetchLoanTypeDatas = async (id) => {
  try {
    const loanTypeDatas = await LoanTypeDatas.find({ userId: id });
    console.log(loanTypeDatas);
    return loanTypeDatas || {}; // Return empty object if no data found
  } catch (error) {
    return {}; // Return empty object on error
  }
};

exports.getAllInformation = async (req, res) => {
  try {
    const id = req.params.id;

    const [jobDetails, joDocuments, stepFormData, loanTypeDatas] =
      await Promise.all([
        fetchJobDetails(id),
        fetchJoDocuments(id),
        fetchStepFormData(id),
        fetchLoanTypeDatas(id)
      ]);

    const response = {
      jobDetails,
      joDocuments,
      stepFormData,
      loanTypeDatas
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteloan = async (req, res) => {
  const loanTypeId = req.params.id;

  try {
    const result = await LoanTypeDatas.findByIdAndDelete(loanTypeId);
    if (!result) {
      return res.status(404).send("Loan type not found");
    }
    res.send("Loan type deleted successfully");
  } catch (err) {
    res.status(500).send(err);
  }
};
exports.editlontype = async (req, res) => {
  try {
    const { id } = req.params;
    const { loanType, interest, limit } = req.body;

    // Ensure all required fields are present
    if (!loanType || !interest || limit === undefined) {
      return res
        .status(400)
        .json({ error: "Loan Type, Interest, and Limit are required" });
    }

    // Find the loan type by ID and update it
    const updatedLoanType = await LoanTypeDatas.findByIdAndUpdate(
      id,
      { loanType, interest, limit },
      { new: true }
    );

    if (!updatedLoanType) {
      return res.status(404).json({ error: "Loan type not found" });
    }

    res.json({
      message: "Loan type updated successfully",
      loan: updatedLoanType
    });
  } catch (error) {
    console.error("Error updating loan type:", error);
    res.status(500).json({ error: "Failed to update loan type" });
  }
};
// exports.AddAdmin = async (req, res) => {
//   try {
//     await Admin_User.Admin_User.create(req.body);
//     res.send({ message: "User Created Successfully" });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.GetAdminUser = async (req, res) => {
//   try {
//     const data = await Admin_User.Admin_User.findOne({});
//     res.send(data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// const storage = multer.diskStorage({
//   destination: "uploads",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });
// const upload = multer({ storage: storage });

// exports.UploadImgMulter = upload.single("ProfileImg");

// exports.UpdateAdmin = async (req, res) => {
//   try {
//     let updateData = req.body;
//     if (req.file) {
//       updateData.ProfileImg = req.file.path;
//     }
//     const updatedAdmin = await Admin_User.Admin_User.findOneAndUpdate(
//       {},
//       { $set: updateData },
//       { new: true }
//     );
//     res.redirect("/users-profile");
//   } catch (error) {
//     console.error("Error updating admin:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.ChangeAdminPassword = async (req, res) => {
//   try {
//     const { CurrentPassword, NewPassword } = req.body;
//     const updatedDocument = await Admin_User.Admin_User.findOneAndUpdate(
//       { Password: CurrentPassword },
//       { $set: { Password: NewPassword } },
//       { new: true }
//     );
//     if (!updatedDocument) {
//       return res.status(404).send("Incorrect Password");
//     }
//     res.send({ message: true });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

// exports.DeleteAdminImg = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const result = await Admin_User.Admin_User.updateOne(
//       { Email: email.trim() },
//       { $unset: { ProfileImg: true } }
//     );
//     res.send({ message: result.nModified > 0 });
//   } catch (error) {
//     console.error("Error deleting profile image:", error);
//     res.status(500).send({ message: false });
//   }
// };

// const storageIcon = multer.memoryStorage();
// const uploadicon = multer({ storage: storageIcon });

// exports.UploadImgMulter1 = uploadicon.single("SliderImg");
const calculateMonthlyEmi = (LoanAmount, InterestRate, LoanTenureMonths) => {
  // Convert annual interest rate to monthly and calculate
  const monthlyInterestRate = InterestRate / 100 / 12;
  const denominator = Math.pow(1 + monthlyInterestRate, LoanTenureMonths) - 1;
  const emi =
    LoanAmount *
    monthlyInterestRate *
    (Math.pow(1 + monthlyInterestRate, LoanTenureMonths) / denominator);
  return emi;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  }
});

exports.fetchCompanyProfiletwo = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    // Fetch company profile (assuming it is global or default for all users)
    const companyProfile = await CompanyProfile.findOne({});

    // Fetch user registration details
    const user = await FileUpload.findOne({ userId: userId });

    // If company profile or user registration details are not found, return null
    if (!companyProfile || !user) {
      return res.status(200).json({
        success: true,
        message: "Data not found",
        data: {
          companyProfile: companyProfile || null,
          user: user || null
        }
      });
    }
    // Extract jobType from user data
    const { loanType } = user;
    console.log(loanType, "jobType");
    // Fetch loan types based on jobType
    // Assuming 'loanType' is a string field in LoanTypeDatas model
    const loanTypes = await LoanTypeDatas.find({ loanType }).select("limit");

    // console.log(loanTypes)
    // loanTypes.forEach((doc) => {
    //   console.log(doc.loanType);
    // });

    // Return the results
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        companyProfile,
        user,
        loanTypes
      }
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const upload = multer({ storage: storage });
exports.step2Details = [
  upload.single("incomeProof"),
  async (req, res) => {
    try {
      const { userId, income, loanType, phone, email } = req.body;
      console.log(
        userId,
        income,
        loanType,
        phone,
        email,
        "userId, income, jobType, phone, email "
      );
      const incomeProof = req.file ? req.file.path : null; // Check if file exists

      // Check if user details already exist in jobDetails based on userId
      let existingRecord = await jobDetails.findOne({ userId });

      if (existingRecord) {
        // Update existing record
        existingRecord.income = income;
        existingRecord.loanType = loanType;
        if (incomeProof) {
          existingRecord.incomeProof = incomeProof; // Only update if incomeProof is provided
        }
        existingRecord.phone = phone;
        existingRecord.email = email;
        await existingRecord.save();
        res
          .status(200)
          .json({ message: "Income details updated successfully" });
      } else {
        // Insert new record
        const newIncomeDetails = new jobDetails({
          userId,
          income,
          phone,
          email,
          loanType,
          incomeProof
        });

        await newIncomeDetails.save();
        res.status(200).json({ message: "Income details saved successfully" });
      }
    } catch (error) {
      console.error("Error saving income details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];
exports.step3Details = async (req, res) => {
  try {
    const { userId, phone, email } = req.body;
    const { adhaarFront, adhaarBack, panFront, userPhoto, Signature } =
      req.files;

    // Ensure all files are uploaded
    if (!adhaarFront || !adhaarBack || !panFront || !userPhoto || !Signature) {
      return res.status(400).json({ message: "All files must be uploaded" });
    }

    // Convert file buffers to Base64 strings
    const adhaarFrontBase64 = adhaarFront[0].buffer.toString("base64");
    const adhaarBackBase64 = adhaarBack[0].buffer.toString("base64");
    const panFrontBase64 = panFront[0].buffer.toString("base64");
    const userPhotoBase64 = userPhoto[0].buffer.toString("base64");
    const signatureBase64 = Signature[0].buffer.toString("base64");

    const existingDocument = await JoDocuments.findOne({ userId });

    if (existingDocument) {
      // Update existing document
      existingDocument.adhaarFront = adhaarFrontBase64;
      existingDocument.adhaarBack = adhaarBackBase64;
      existingDocument.panFront = panFrontBase64;
      existingDocument.userPhoto = userPhotoBase64;
      existingDocument.Signature = signatureBase64;
      existingDocument.userId = userId;

      await existingDocument.save();
      return res
        .status(200)
        .json({ message: "Documents updated successfully." });
    } else {
      // Create new document
      const newDocument = new JoDocuments({
        userId,
        adhaarFront: adhaarFrontBase64,
        adhaarBack: adhaarBackBase64,
        panFront: panFrontBase64,
        userPhoto: userPhotoBase64,
        Signature: signatureBase64,
        phone,
        email
      });

      await newDocument.save();
      return res
        .status(200)
        .json({ message: "Documents uploaded successfully." });
    }
  } catch (error) {
    console.error("Error saving documents:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.securityAmount = async (req, res) => {
  try {
    const { userIdtwo, transactionnumbertwo } = req.body;
    console.log(
      userIdtwo,
      transactionnumbertwo,
      "userIdtwo, transactionnumbertwo"
    );
    const inserData = new SecurityData({
      transactionnumbertwo,
      userIdtwo
    });
    await inserData.save();
    res.status(200).json("data Saved");
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.updateSecurityFeeStatus = async (req, res) => {
  const { id, status } = req.body;
  console.log(id, status, " id, status ");

  try {
    // Validate input
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }

    // Fetch the document from SecurityData
    const securityData = await SecurityData.findById(id);

    // Check if the document exists
    if (!securityData) {
      return res.status(404).json({ error: "Security data not found" });
    }

    // Update the status
    securityData.Status = status;
    await securityData.save();

    // Respond with success
    res.status(200).json({
      message: "Status updated successfully",
      updatedData: securityData
    });
  } catch (error) {
    console.error("Error updating security fee status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.processingFeeDataFetchStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "UserId is required" });
    }

    // Fetch the data for the given userId
    const userFeeData = await processingFeeData.findOne({ userId });
    console.log(userFeeData, "userFeeData");
    if (userFeeData) {
      const { Status } = userFeeData;
      // Check if status is 0 or 1
      if (Status === 0 || Status === 1) {
        return res.status(200).json({ success: true, result: true });
      } else {
        return res.status(200).json({ success: true, result: false });
      }
    } else {
      return res.status(200).json({ success: true, result: false });
    }
  } catch (error) {
    console.error("Error fetching processing fee data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
exports.updateProcessingFeeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    console.log(id, status);
    if (!id || !status) {
      return res.status(400).json({ message: "ID and status are required." });
    }

    // Update the status in the database
    const updatedFee = await processingFeeData.findByIdAndUpdate(
      id,
      { Status: status },
      { new: true }
    );

    if (!updatedFee) {
      return res.status(404).json({ message: "Record not found." });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully.", data: updatedFee });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// New method to fetch data where status is 1
exports.getProcessingFeeDataWithStatus = async (req, res) => {
  try {
    const { id } = req.params; // Getting userId from route parameters
    const dataWithStatusOne = await processingFeeData.findOne({ userId: id }); // Fetching data for the specific userId
    res.status(200).json(dataWithStatusOne); // Responding with the fetched data
  } catch (error) {
    // Handle errors properly
    console.error("Error fetching processing fee data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getProcessingFeeDataWithStatusZero = async (req, res) => {
  try {
    const dataWithStatusOne = await processingFeeData.find({ Status: 0 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.checkStatatSecurity = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters

  try {
    // Find the document in SecurityData where the userId matches
    const securityData = await SecurityData.findOne({ userId });
    console.log(securityData.Status, "securityData");
    // Check if securityData exists and return the Status
    if (securityData) {
      res.status(200).json({ Status: securityData.Status });
    } else {
      res.status(200).json({ Status: 0 }); // Return false when no data is found
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New method to fetch data where status is 1
exports.getProcessingFeeDataWithStatusOne = async (req, res) => {
  try {
    const dataWithStatusOne = await processingFeeData.find({ Status: 1 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};
// New method to fetch data where status is 1
exports.getProcessingFeeDataWithStatusTwo = async (req, res) => {
  try {
    const dataWithStatusOne = await processingFeeData.find({ Status: 2 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.Statusendpoint = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    // Fetch data from both collections based on userId
    const processingFee = await processingFeeData.findOne({ userId });
    const step4Details = await Step4Details.findOne({ userId });
    // Determine status based on data presence and status field
    const statusOne = processingFee ? processingFee.Status == 1 : 0;
    const statusTwo = step4Details ? step4Details.Status == 1 : 0;

    // Respond with status values
    res.status(200).json({
      statusOne,
      statusTwo
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.userDetailData = async (req, res) => {
  try {
    const data = await Registration.find();
    // console.log(data, "data");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in userDetailData:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

// controllers/userController.js
exports.personalDetailsOfUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    // Find user details from the Registration collection using the userId
    const userRegistration = await Registration.find({ _id: userId });
    // console.log("User Registration:", userRegistration);
    if (userRegistration.length === 0) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Find file upload details related to the user
    const userFileUploads = await FileUpload.find({ userId: userId });
    console.log("User File Uploads:", userFileUploads);

    // Combine the data
    const response = {
      userRegistration: userRegistration[0], // Assuming there's only one user with this ID
      userFileUploads
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching personal details:", error);
    res.status(500).json({ error: error.message });
  }
};

// module.exports = { personalDetailsOfUser };

exports.getSecurityFeeDataWithStatusZero = async (req, res) => {
  try {
    const dataWithStatusOne = await SecurityData.find({ Status: 0 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};
// New method to fetch data where status is 1
exports.getSecurityFeeDataWithStatusOne = async (req, res) => {
  try {
    const dataWithStatusOne = await SecurityData.find({ Status: 1 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getSecurityFeeDataWithStatusOneFront = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await SecurityData.findOne({ userId });
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json(error);
  }
};
// New method to fetch data where status is 1
exports.getSecurityFeeDataWithStatusTwo = async (req, res) => {
  try {
    const dataWithStatusOne = await SecurityData.find({ Status: 2 });
    res.status(200).json(dataWithStatusOne);
  } catch (error) {
    res.status(500).json({ error });
  }
};
exports.stepfourdetails = async (req, res) => {
  try {
    const { loanType, amount, years, phone, Status, email, userId } = req.body;

    // Validate input
    if (
      !loanType ||
      !amount ||
      !years ||
      !phone ||
      !Status ||
      !email ||
      !userId
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if Step4Details exist and update or create
    let existingDetails = await Step4Details.findOne({ userId });
    if (existingDetails) {
      existingDetails.loanType = loanType;
      existingDetails.amount = amount;
      existingDetails.years = years;
      existingDetails.phone = phone;
      existingDetails.Status = Status;
      existingDetails.email = email;
      await existingDetails.save();
    } else {
      const newStep4Details = new Step4Details({
        loanType,
        amount,
        years,
        phone,
        email,
        userId,
        Status
      });
      await newStep4Details.save();
    }

    // Check if SecurityData exists and update or create
    let securityData = await SecurityData.findOne({ userId });
    if (securityData) {
      securityData.phone = phone;
      securityData.email = email;
      await securityData.save();
    } else {
      const newSecurityData = new SecurityData({
        phone,
        email,
        userId
      });
      await newSecurityData.save();
    }

    // Check if ProcessingFeeData exists and update or create
    let ProcessingFeeData = await processingFeeData.findOne({ userId });
    if (ProcessingFeeData) {
      ProcessingFeeData.phone = phone;
      ProcessingFeeData.email = email;
      await ProcessingFeeData.save();
    } else {
      const newProcessingFeeData = new processingFeeData({
        phone,
        email,
        userId
      });
      await newProcessingFeeData.save();
    }

    res.status(200).json({ message: "Step 4 details processed successfully" });
  } catch (error) {
    console.error("Error submitting step 4 details:", error);
    res.status(500).json({ error: "Error submitting step 4 details" });
  }
};
exports.step1Details = async (req, res) => {
  try {
    const { name, userId, email, phone, address, pinCode, fatherName } =
      req.body;
    console.log(name, userId, email, phone, address, pinCode, fatherName);

    // Check if the user details already exist based on userId
    const existingDetails = await StepFormData.findOne({ userId });

    if (existingDetails) {
      // Update the existing details
      existingDetails.name = name;
      existingDetails.address = address;
      existingDetails.pinCode = pinCode;
      existingDetails.fatherName = fatherName;

      await existingDetails.save();
      return res
        .status(200)
        .json({ message: "User details updated successfully" });
    } else {
      // If no existing details, create a new instance of UserDetails
      const userDetails = new StepFormData({
        name,
        userId,
        email,
        phone,
        address,
        pinCode,
        fatherName
      });
      await userDetails.save();
      return res
        .status(200)
        .json({ message: "User details saved successfully" });
    }
  } catch (error) {
    console.error("Error saving user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.PackageDataController = async (req, res) => {
  try {
    const { LoanType, Intrest, Duration, status, Amount } = req.body;

    // Calculate MonthlyEmi
    const LoanAmount = parseFloat(Amount); // Assuming Amount is the loan principal
    const InterestRate = parseFloat(Intrest); // Assuming Intrest is the annual interest rate
    const LoanTenureMonths = parseFloat(Duration) * 12; // Assuming Duration is in years, convert to months

    const MonthlyEmi = calculateMonthlyEmi(
      LoanAmount,
      InterestRate,
      LoanTenureMonths
    );

    // Round MonthlyEmi to one decimal place
    const RoundedMonthlyEmi = Math.round(MonthlyEmi * 10) / 10; // Rounds to one decimal place

    // Check if the LoanType exists in a case-insensitive manner
    const existingData = await PackageData.findOne({
      LoanType: { $regex: new RegExp(`^${LoanType}$`, "i") }
    });

    if (!existingData) {
      // LoanType does not exist, insert the incoming data
      const newData = new PackageData({
        LoanType,
        Intrest,
        MonthlyEmi: RoundedMonthlyEmi, // Save rounded MonthlyEmi
        Amount,
        Duration,
        status
      });
      await newData.save();
      res
        .status(201)
        .json({ message: "Data inserted successfully", data: newData });
    } else {
      // LoanType exists, update the existing data
      const updatedData = await PackageData.findOneAndUpdate(
        { _id: existingData._id },
        {
          $set: {
            LoanType,
            Intrest,
            MonthlyEmi: RoundedMonthlyEmi,
            Duration,
            status,
            Amount
          }
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Data updated successfully", data: updatedData });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { LoanType, Amount, Interest, Duration } = req.body;

  console.log("Received Data:", LoanType, Amount, Interest, Duration, id);

  // Calculate MonthlyEmi
  const LoanAmount = parseFloat(Amount);
  const InterestRate = parseFloat(Interest);
  const LoanTenureMonths = parseFloat(Duration) * 12;

  const MonthlyEmi = calculateMonthlyEmi(
    LoanAmount,
    InterestRate,
    LoanTenureMonths
  );

  // Round MonthlyEmi to one decimal place
  const RoundedMonthlyEmi = Math.round(MonthlyEmi * 10) / 10;

  try {
    // Find the package by ID and update it with the new data
    const updatedPackage = await PackageData.findByIdAndUpdate(
      id,
      {
        LoanType,
        Amount,
        Intrest: Interest,
        Duration,
        MonthlyEmi: RoundedMonthlyEmi
      },
      { new: true, runValidators: true } // This option returns the updated document and runs schema validators
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Log the updated package
    console.log("Updated Package:", updatedPackage);

    res
      .status(200)
      .json({ message: "Package updated successfully", data: updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.DeletePackage = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id, "id");
    const deletedItem = await PackageData.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res
      .status(200)
      .json({ message: "Item deleted successfully", data: deletedItem });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Controller function
exports.updateCompanyProfile = async (req, res) => {
  try {
    const { charges1, charges2, address, contactNo, email, upiId, nameOnUPI } =
      req.body;

    // Initialize an update object
    let updateFields = {};

    // Check each field and add to update object if it's not null or undefined
    if (charges1) updateFields.charges1 = charges1;
    if (charges2) updateFields.charges2 = charges2;
    if (address) updateFields.address = address;
    if (contactNo) updateFields.contactNo = contactNo;
    if (email) updateFields.email = email;
    if (upiId) updateFields.upiId = upiId;
    if (nameOnUPI) updateFields.nameOnUPI = nameOnUPI;

    // Convert buffer to Base64 string if files are present
    if (req.files["paymentQRCharges1"]) {
      updateFields.paymentQRCharges1 =
        req.files["paymentQRCharges1"][0].buffer.toString("base64");
    }
    if (req.files["paymentQRCharges2"]) {
      updateFields.paymentQRCharges2 =
        req.files["paymentQRCharges2"][0].buffer.toString("base64");
    }
    if (req.files["Signature"]) {
      updateFields.Signature =
        req.files["Signature"][0].buffer.toString("base64");
    }
    if (req.files["logo"]) {
      updateFields.logo = req.files["logo"][0].buffer.toString("base64");
    }

    // Update or create the company profile document
    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      {}, // Assuming there's only one company profile document to update
      { $set: updateFields }, // Use $set to update only provided fields
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.CompanyProfileScn = async (req, res) => {
  try {
    const data = await CompanyProfile.find(
      {},
      "paymentQRCharges1 paymentQRCharges2 Signature logo"
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.FetchPackageDataController = async (req, res) => {
  try {
    const data = await PackageData.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.fetchCompanyProfile = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({});

    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: companyProfile
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.EditName = async (req, res) => {
  try {
    const { id, username } = req.body;
    const updatedUser = await userloginDatas.findOneAndUpdate(
      { _id: id },
      { $set: { username: username } },
      { new: true }
    );
    if (updatedUser) {
      res
        .status(200)
        .json({ message: "Username updated successfully", updatedUser });
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.changePasswordfirst = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Convert password to string
    const passwordStr = String(password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(passwordStr, 10); // Salt rounds should be a number

    const count = await User.countDocuments();
    if (count === 0) {
      // If the collection is empty, insert a new document
      const newUser = new User({
        password: hashedPassword,
        username
      });
      await newUser.save();
      return res.status(201).json({ message: "User created successfully." });
    } else {
      // If the collection is not empty, update the existing document
      const result = await User.findOneAndUpdate(
        {},
        { password: hashedPassword, username }, // Update the document with new data
        { new: true } // Return the updated document
      );
      return res
        .status(200)
        .json({ message: "User updated successfully.", data: result });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.ChangeAdminPassword = async (req, res) => {
  try {
    const { username, CurrentPassword, NewPassword } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(CurrentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect Password");
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NewPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.FetchPersonalUserdetails = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch company profile data for charges1 and charges2
    const companyProfile = await CompanyProfile.findOne(
      {},
      "charges1 charges2"
    );
    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Fetch user details from the Registration table
    const registrationData = await Registration.findById(userId);
    if (!registrationData) {
      return res
        .status(404)
        .json({ message: "User not found in Registration table." });
    }

    // Fetch user file uploads from the FileUpload table
    const fileUploadData = await FileUpload.findOne({ userId: userId });
    if (!fileUploadData) {
      return res
        .status(404)
        .json({ message: "User not found in FileUpload table." });
    }

    // Extract the loanType from fileUploadData
    const { loanType } = fileUploadData;

    // Fetch the loan type data from the LoanTypeDatas table
    let loanTypeData = {};
    if (loanType) {
      loanTypeData = await LoanTypeDatas.findOne({ loanType: loanType });
    }

    // Combine all data objects
    const userDetails = {
      ...registrationData.toObject(), // Convert Mongoose document to plain object
      ...fileUploadData.toObject(), // Convert Mongoose document to plain object
      loanTypeDetails: loanTypeData || {}, // Include an empty object if loanTypeData is not found
      charges1: companyProfile.charges1 || 0,
      charges2: companyProfile.charges2 || 0
    };

    // Respond with the combined user details
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
};

// exports.changePassword = async (req, res) => {
//   try {
//     const { CurrentPassword, NewPassword } = req.body;
//     console.log(
//       CurrentPassword,
//       NewPassword,
//       "changePasswordchangePasswordchangePasswordchangePassword"
//     );
//     // Find the user from the token or any identifier, assuming you have user ID from token
//     const userId = req.user.id; // Assuming req.user is set from middleware
//     if (!userId)
//       return res.status(400).json({ message: "User not authenticated" });

//     // Fetch the user from the database
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Check if the current password matches the stored password
//     if (CurrentPassword !== user.password) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Update the user with the new password
//     user.password = NewPassword; // Directly update the password without hashing
//     await user.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.register = async (req, res) => {
  const { phoneNumber, email, password, income, jobType, address, Username } =
    req.body;

  try {
    // Check if user with the same email already exists
    let user = await Registration.findOne({ email });
    if (user) {
      console.log("Email already exists");
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Check if user with the same phone number already exists
    user = await Registration.findOne({ phoneNumber });
    if (user) {
      console.log("Phone number already exists");
      return res.status(400).json({ msg: "Phone number already exists" });
    }

    // Create a new user instance
    user = new Registration({
      phoneNumber,
      email,
      password,
      income,
      jobType,
      address,
      Username
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();
    console.log("User registered successfully");
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ msg: "Error registering user: " + error.message });
  }
};

exports.frontsubmitForm = async (req, res) => {
  try {
    const profilePhotoUpload = req.files["profilePhotoUpload"]
      ? req.files["profilePhotoUpload"][0].buffer.toString("base64")
      : null;
    const adharcardFront = req.files["adharcardFront"]
      ? req.files["adharcardFront"][0].buffer.toString("base64")
      : null;
    const adharcardBack = req.files["adharcardBack"]
      ? req.files["adharcardBack"][0].buffer.toString("base64")
      : null;
    const pancardPhoto = req.files["pancardPhoto"]
      ? req.files["pancardPhoto"][0].buffer.toString("base64")
      : null;

    const adharcardNumber = req.body.adharcardNumber;
    const pancardNumber = req.body.pancardNumber;
    const loanAmount = req.body.loanAmount;
    const duration = req.body.duration;
    const loanType = req.body.loanType;
    const capturedPhotoData = req.body.capturedPhotoData;

    // Ensure userId is provided in the request body
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch user data from Registration table
    const userData = await Registration.findOne({ _id: userId });
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    // Insert email, phone, userId into processingFeeData table
    const processingFeeDat = new processingFeeData({
      email: userData.email,
      phone: userData.phoneNumber,
      userId: userData._id
    });
    console.log(processingFeeDat, "processingFeeDat");

    await processingFeeDat.save();

    // Insert email, phone, userId into SecurityData table
    const securityData = new SecurityData({
      email: userData.email,
      phone: userData.phoneNumber,
      userId: userData._id
    });

    await securityData.save();

    // Define the update object
    const update = {
      profilePhotoUpload,
      adharcardFront,
      adharcardBack,
      pancardPhoto,
      adharcardNumber,
      pancardNumber,
      loanAmount,
      duration,
      loanType,
      capturedPhotoData
    };

    // Perform the upsert operation
    await FileUpload.findOneAndUpdate(
      { userId }, // Filter
      { $set: update }, // Update
      { upsert: true, new: true } // Options: create if not exists, return the new document
    );

    res
      .status(200)
      .json({ message: "Form submitted and files saved successfully!" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the form data." });
  }
};

exports.frontlogin = async (req, res) => {
  const { phoneNumber, password } = req.body;
  console.log("Login request body:", req.body);

  try {
    // Check if user with the phone number exists
    let user = await Registration.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ msg: "Invalid phone number or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid phone number or password" });
    }

    // Check if processingFeeData and SecurityData exist for the user
    const processingFeeDat = await processingFeeData.findOne({
      phone: phoneNumber
    });
    const securityData = await SecurityData.findOne({ phone: phoneNumber });
    // console.log(processingFeeDat, securityData);
    // If data is found, get statuses
    let processingFeeStatus = null;
    let securityStatus = null;

    if (processingFeeDat) {
      processingFeeStatus = processingFeeDat.Status;
    }

    if (securityData) {
      securityStatus = securityData.Status;
    }

    // Generate JWT token
    const token = jwt.sign({ user: { id: user.id } }, "hi", {
      expiresIn: "2d"
    });

    // Return the token along with status if available
    res.status(200).json({
      token,
      processingFeeStatus,
      securityStatus
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Error during login: " + error.message });
  }
};
exports.forgotpasswordfront = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  try {
    // Check if the user exists
    let user = await Registration.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this phone number does not exist" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Save the updated user
    await user.save();
    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ msg: "Error resetting password: " + error.message });
  }
};
exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password, "username, password");

  try {
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, "king", {
      expiresIn: "1h"
    });

    // Send token in HTTP-only cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Cookie expires in 1 hour

    // Respond with success message
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
