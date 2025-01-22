const connectToDatabase = require("../database/db");
const User = require("../models/userModel");
const corsHeaders = require("../utils/corsHeaders");

exports.userHandler = async (event) => {
  try {
    // Handle OPTIONS Preflight Request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "CORS preflight successful" }),
      };
    }

    // Connect to the database
    await connectToDatabase();

    const { httpMethod, body, pathParameters } = event;

    if (httpMethod === "GET") {
      const users = await User.find().sort({ createdAt: -1 });
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(users),
      };
    }

    if (httpMethod === "POST") {
      const { name, email, phoneno, address, username, password } = JSON.parse(body);

      if (!name || !email || !phoneno || !username || !password) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Missing required fields." }),
        };
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          statusCode: 409,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Email already exists." }),
        };
      }

      const newUser = new User({ name, email, phoneno, address, username, password });
      const savedUser = await newUser.save();

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ message: "User created successfully", userId: savedUser._id }),
      };
    }

    if (httpMethod === "DELETE") {
      if (!pathParameters || !pathParameters.id) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "User ID is required." }),
        };
      }

      const { id } = pathParameters;
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: "User not found." }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "User deleted successfully" }),
      };
    }

    if (httpMethod === "PUT") {
      if (!pathParameters || !pathParameters.id) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "User ID is required." }),
        };
      }

      const { id } = pathParameters;
      const updatedData = JSON.parse(body);

      const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });

      if (!updatedUser) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: "User not found." }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "User updated successfully", user: updatedUser }),
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
