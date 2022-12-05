const { User } = require ('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if(context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password');

                return userData;
            }
            throw new AuthenticationError('Must be Logged-in.');
        }
    },
    Mutation: {
    saveBook: async (_parent, { bookData }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: bookData } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('Must be Logged-in.');
    },
    removeBook: async (_parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('Must be Logged-in.');
    },
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });
    
            if (!user) {
                throw new AuthenticationError('User not found.');
            }
    
            const correctPw = await user.isCorrectPassword(password);
    
            if (!correctPw) {
                throw new AuthenticationError('Invalid Credentials.');
            }
    
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        }
    },
};

module.exports = resolvers;
