const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      users: async () => {
        return User.find();
      },
      me: async (parent, args, context) => {
        if (context.user) {
          return await User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    },

    Mutation: {
        async createUser (parent, { username, email, password }) {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return ({ token, user });
          },
          async login (parent, { email, password })  {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return ({ token, user });
          },
          async saveBook (parent, args, context) {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true, runValidators: true }
                  );
                  return updatedUser;
                
                }
            throw new AuthenticationError('You need to be logged in!');
          },
          async deleteBook (parent, { bookId }, context) {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                  );
                  
                  return updatedUser;
                }
      throw new AuthenticationError('You need to be logged in!');
    }
}
}


module.exports = resolvers;