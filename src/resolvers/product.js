const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
const mime = require('mime-types')

module.exports = {
    Query: {
        product: async (parent, args, context, info) => {
            const product = await context.dataSources.mongoAPI.product(args.id);
            return product;
        },
        products: async (parent, args, context, info) => {
            console.log('got products', args)
            const products = await context.dataSources.mongoAPI.products(args.limit, args.skip, args.query);
            return products;
        }
    },
    Mutation: {
        createProduct: async (parent, args, context, info) => {
            const product = await context.dataSources.mongoAPI.createProduct(args.product);
            if (product) return product;
            throw new ApolloError('Could not create product', 'ACTION_NOT_COMPLETED', {});
        },
        updateProduct: async (parent, args, context, info) => {
            if (args?.product?.featurePicture){
                console.log('Attempting to get fileUrl from FireBase');
                let mimeType = args?.product?.featurePicture.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                const fileUrl = await context.dataSources.firebaseAPI.uploadFile(mime.extension(mimeType), `product-feature-pictures/${args.product.id}`, { working: true }, mimeType, args.product.featurePicture);
                console.log(fileUrl)
                args.product.featurePicture = fileUrl;
            }
            if (args?.product?.distiPicture){
                console.log('Attempting to get fileUrl from FireBase');
                let mimeType = args?.product?.distiPicture.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                const fileUrl = await context.dataSources.firebaseAPI.uploadFile(mime.extension(mimeType), `product-disti-pictures/${args.product.id}`, { working: true }, mimeType, args.product.distiPicture);
                console.log(fileUrl)
                args.product.distiPicture = fileUrl;
            }
            console.log(args);
            const updated = await context.dataSources.mongoAPI.updateProduct(args.product);
            if (updated) return updated;
            throw new ApolloError('Could not update product', 'ACTION_NOT_COMPLETED', {});
        },
        deleteProduct: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteProduct(args.id);
            return deleted;
            throw new ApolloError('Could not delete product', 'ACTION_NOT_COMPLETED', {});
        },
    },
};