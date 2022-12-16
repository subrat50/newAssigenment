const userModel = require("../model/userModel")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
//  __________________________________-----validation ----------__________________________________________

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;

}
const isValidPassword = function (value) {
    const password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
    return password.test(value)
}
const isValidName = function (value) {
    const dateName = /^[a-zA-Z_ ]{2,100}$/
    return dateName.test(value)
}


const isvalidRequest = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const createUser = async function (req, res) {
    try {
        let requestBody = req.body

        //validation for request body
        if (!isvalidRequest(requestBody)) return res.status(400).send({ status: false, message: "Invalid request, please provide details" })

        //destructring request body
        let { email, phone, password, address } = requestBody

        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: " email is required" });
            return
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: "Enter a valid email" })
        }
        let uniqueEmail = await userModel.findOne({ email: email });
        if (uniqueEmail) {
            return res.status(400).send({ status: false, msg: "email  already Used" })
        }
        if (!isValid(password))
            return res.status(400).send({ status: false, message: "Password is a mendatory field" })

        if (!isValidPassword(password))
            return res.status(400).send({ status: false, message: `Password  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long` })

        const salt = await bcrypt.genSalt(10);
        requestBody.password = await bcrypt.hash(password, salt);
        console.log(password)

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "mobile_number is required" });

        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            res.status(400).send({ status: false, message: "Please provide valid  indian mobile number" });
            return;
        }


        let uniqueMobile = await userModel.findOne({ phone: phone });
        if (uniqueMobile) {
            return res.status(400).send({ status: false, msg: "mobile_number already Used" })
        }

        if (!isValid(address)) {
            res.status(400).send({ status: false, msg: " address is required" });
            return
        }
        const CreatedUser = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: "succesfully created", data: CreatedUser })

    } catch (err) {

        return res.status(500).send({ status: false, message: err.message })
    }

}

const loginUser = async function (req, res) {
    try {
        let requestbody = req.body
        let { email, password } = requestbody
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: "Enter a valid email" })
        }
        let uniqueEmail = await userModel.findOne({ email: email });
        if (!uniqueEmail) {
            return res.status(400).send({ status: false, message: "email is not correct" })
        }
        if (!isValid(password))
            return res.status(400).send({ status: false, message: "Password is a mendatory field" })

        if (!isValidPassword(password))
            return res.status(400).send({ status: false, message: `Password  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long` })


        let checkpass = await bcrypt.compare(password, uniqueEmail.password);
        if (!checkpass) return res.status(400).send("password is incorrect")


        const token = jwt.sign({
            userId: uniqueEmail._id
        }, 'userPro',
            { expiresIn: '48hr' });
        res.header("x-api-key", token)
        return res.status(200).send({ msg: "login successfully", data: token, userId: uniqueEmail._id })
    }

    catch (err) {
        return res.status(500).send({ status: false, messege: err.message })
    }
}

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send("user id required")
        let user = await userModel.findById({ _id: userId })
        if (!user) return res.status(400).send("user is not found")

        return res.status(200).send({ status: true, data: user })

    } catch (error) {
        return res.status(500).send({ status: falze, messege: "internal server error" })
    }
}

const updateuser = async function (req, res) {
    try {
        userId = req.params.userId
        data = req.body

        if (!isvalidRequest(data)) 
        return res.status(400).send({ status: false, message: "Invalid request, please provide details" })

        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is not provided." })
        }
        if (!validator.isMongoId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: "user not found" })
        }
        if (user.isdeleted == true) {
            return res.status(404).send({ status: false, message: "user is already deleted." })
        }


        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "No details provided. So nothing to update." })
        }
        let { email, phone, password, address } = data


        if (phone) {


            if (phone == "") {
                return res.status(400).send({ status: false, message: "phone should not be empty" })
            }
            if (!/^[6-9]\d{9}$/.test(phone)) {
                res.status(400).send({ status: false, message: "Please provide valid  indian mobile number" });
                return;
            }
            let uniqueMobile = await userModel.findOne({ phone: phone });
            if (uniqueMobile) {
                return res.status(400).send({ status: false, msg: "mobile no. already Used" })
            }
        }


        if (email) {


            if (email == "") {
                return res.status(400).send({ status: false, msg: "please enter email as a value" });

            }
            if (!validator.isEmail(email)) {
                return res.status(400).send({ status: false, msg: "Enter a valid email" })
            }
            let uniqueEmail = await userModel.findOne({ email: email });
            if (uniqueEmail) {
                return res.status(400).send({ status: false, msg: "email to update is already there." })
            }
        }



        if (password) {
            if (password == "") { return res.send({ msg: "password can not empty" }) }
            if (password) {

                const salt = await bcrypt.genSalt(10);
                requestbody.password = await bcrypt.hash(password, salt);
                console.log(password)

            }
        }
        if (address) {

            if (address == "") {
                return res.status(400).send({ status: false, message: "address should not be empty" })
            }
            if (!isValidName(address)) {
                return res.status(400).send({ status: false, message: "Kindly enter address invalid format and it should only conatin alphabets" })
            }

        }

        const updatedData = await userModel.findOneAndUpdate({ _id: userId, isDeleted: false }, { phone: phone, address: address, email: email, phone: phone, password: data.password }, { new: true })

        return res.status(200).send({ status: true, message: "success", data: updatedData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.messege })
    }
}

const deleteuser = async function (req, res) {
    try {
        let userId = req.params.userId
        // let requestbody = req.body
        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is not provided." })
        }
        if (!validator.isMongoId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }
        let userpro = await userModel.findById({ _id: userId, isdeleted: false })
        if (!userpro) return res.send({ msg: "user is not found" })

        //    if(userpro.isdeleted===true){
        //     return res.send({msg:"user is already delted"})
        //    }
        let updateuser = await userModel.findByIdAndUpdate({ _id: userId }, {
            isdeleted: true
        }, { new: true })
        return res.status(200).send({ status: true, msg: "user deleted sucessfully", data: updateuser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.messege })
    }
}

module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUser = getUser
module.exports.updateuser = updateuser
module.exports.deleteuser = deleteuser
