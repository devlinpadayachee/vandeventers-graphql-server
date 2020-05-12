const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
const mime = require('mime-types')

module.exports = {
    Query: {
        post: async (parent, args, context, info) => {
            const post = await context.dataSources.mongoAPI.post(args.id);
            return post;
        },
        posts: async (parent, args, context, info) => {
            const posts = await context.dataSources.mongoAPI.posts(args.limit, args.skip, args.query);
            return posts;
        }
    },
    Mutation: {
        createPost: async (parent, args, context, info) => {
            const post = await context.dataSources.mongoAPI.createPost(args.post);
            if (post) return post;
            throw new ApolloError('Could not create post', 'ACTION_NOT_COMPLETED', {});
        },
        updatePost: async (parent, args, context, info) => {
            if (args?.post?.featurePicture){
                console.log('Attempting to get fileUrl from FireBase');
                let mimeType = args?.post?.featurePicture.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                const fileUrl = await context.dataSources.firebaseAPI.uploadFile(mime.extension(mimeType), `post-feature-pictures/${args.post.id}`, { working: true }, mimeType, args.post.featurePicture);
                console.log(fileUrl)
                args.post.featurePicture = fileUrl;
            }
            const updated = await context.dataSources.mongoAPI.updatePost(args.post);
            if (updated) return updated;
            throw new ApolloError('Could not update post', 'ACTION_NOT_COMPLETED', {});
        },
        deletePost: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deletePost(args.id);
            return deleted;
            throw new ApolloError('Could not delete post', 'ACTION_NOT_COMPLETED', {});
        },
    },
};