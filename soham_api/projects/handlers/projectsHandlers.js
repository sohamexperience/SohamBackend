const connectToDatabase = require("../database/db");
const Project = require("../models/project");
const corsHeaders = require("../utils/corsHeaders");

exports.projectHandler = async (event) => {
    try {
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: "CORS preflight successful" }),
            };
        }

        // Connect to the database
        await connectToDatabase();

        const { httpMethod, body, pathParameters, path } = event;
        const { id } = pathParameters || {};

        console.log ("pathParameters", id);

        // Parse body if provided
        let parsedBody;
        if (body) {
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: "Invalid JSON in request body" }),
                };
            }
        }

        switch (httpMethod) {
            case "GET":
                if (path.includes("/events") && id) {
                    const project = await Project.findById(id);
                    if (!project) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Project not found" }),
                        };
                    }
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify(project.events),
                    };
                } else {
                    const projects = await Project.find().sort({ createdAt: -1 });
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify(projects),
                    };
                }

            case "POST":
                if (path.includes("/events") && id) {
                    const { name, date, description } = parsedBody || {};
                    if (!name || !date) {
                        return {
                            statusCode: 400,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Event name and date are required" }),
                        };
                    }
                    const project = await Project.findById(id);
                    if (!project) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Project not found" }),
                        };
                    }

                    const eventUsers = project.users.map((user) => ({
                        ...user.toObject(),
                        attendance: false,
                    }));

                    const newEvent = { name, date: new Date(date), description, users: eventUsers };
                    project.events.push(newEvent);
                    await project.save();

                    return {
                        statusCode: 201,
                        headers: corsHeaders,
                        body: JSON.stringify(newEvent),
                    };
                } else if (id) {
                    const { users } = parsedBody || {};
                    if (!users || !Array.isArray(users)) {
                        return {
                            statusCode: 400,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Users must be an array" }),
                        };
                    }

                    const project = await Project.findById(id);
                    if (!project) {
                        return {
                            statusCode: 404,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Project not found" }),
                        };
                    }

                    project.users = [...(project.users || []), ...users];
                    await project.save();

                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify(project),
                    };
                } else {
                    const { name, enable } = parsedBody || {};
                    if (!name) {
                        return {
                            statusCode: 400,
                            headers: corsHeaders,
                            body: JSON.stringify({ message: "Project name is required" }),
                        };
                    }

                    const newProject = new Project({
                        name,
                        enable: enable !== undefined ? enable : true,
                    });
                    await newProject.save();

                    return {
                        statusCode: 201,
                        headers: corsHeaders,
                        body: JSON.stringify(newProject),
                    };
                }

            case "PUT":
                if (!id) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Project ID is required" }),
                    };
                }

                const { name, enable } = parsedBody || {};
                const updatedProject = await Project.findByIdAndUpdate(
                    id,
                    { name, enable, updatedAt: new Date() },
                    { new: true }
                );

                if (!updatedProject) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Project not found" }),
                    };
                }

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify(updatedProject),
                };

            case "DELETE":

            if (path.includes("/projects/events")) {
                // Extract eventId from the URL
                const eventId = path.split("/projects/events/")[1]; // Extract the eventId from the path
                if (!eventId) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Event ID is required" }),
                    };
                }
        
                // Find the project containing the event
                const project = await Project.findOne({ "events._id": eventId });
                if (!project) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Event not found in any project" }),
                    };
                }
        
                // Find and remove the event by eventId
                const eventIndex = project.events.findIndex((event) => event._id.toString() === eventId);
                if (eventIndex === -1) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Event not found" }),
                    };
                }
        
                // Remove the event
                project.events.splice(eventIndex, 1);
                await project.save();
        
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: "Event deleted successfully" }),
                };
            }
               else if (!id) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Project ID is required" }),
                    };
                }

                const deletedProject = await Project.findByIdAndDelete(id);
                if (!deletedProject) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ message: "Project not found" }),
                    };
                }

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: "Project deleted successfully" }),
                };

            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: "Method not allowed" }),
                };
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};
