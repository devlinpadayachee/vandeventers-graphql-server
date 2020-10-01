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
    Product: {
        tags: async (parent, args, context, info) => {
            if (!parent.tagIDs || parent.tagIDs.length === 0) {
                return [];
            }
            const tags = await context.dataSources.mongoAPI.tags(100, 0, { _id: { $in: parent.tagIDs }});
            if (!tags) return null;
            return tags.records;
        }
    }
};

/**

As long as you do realize that you are matching on the ObjectId and not actually anything in the referenced collection you can use the $in operator:

db.collection.find({ "members": { "$in": ["some id 1", "some id 2"] } })
Where of course those are your actual ObjectId values.

But if you really mean a document that has exactly that array, then you just pass in the array:

db.collection.find({ "members": ["some id 1", "some id 2"] })
And if it must have both the elements but could have others then currently you need to use an $and expression:

db.collection.find({
    "$and": [
        { "members": "some id 1" },
        { "members": "some id 2" }
    ]
})
But from release 2.6 an on - wards you can properly use the $all operator to effectively do the same:

db.collection.find({ "members": { "$all": ["some id 1", "some id 2"] } })
The other form is matching those two elements only, but in any order.So there are two approaches:

db.collection.find({
    "$or": [
        { "members": ["some id 1", "some id 2"] },
        { "members": ["some id 2", "some id 1"] }
    ]
})
This uses a logical $or to say that the array must be exact but can be arranged either way.And the other approach:

db.collection.find({
    "$and": [
        { "members": "some id 1" },
        { "members": "some id 2" }
    { "members": { "$size": 2 } }
    ]
})
So this would use $size in order to make sure that when the array contained both of the elements that matched that is also only had just two elements.Which is a nicer syntax than using $or, especially for larger arrays.

And in the future releases as mentioned this gets even cleaner:

db.collection.find({
    "$and": [
        { "members": { "$all": ["some id 1", "some id 2"] } },
        { "members": { "$size": 2 } }
    ]
})
That fairly much covers every interpretation

*/