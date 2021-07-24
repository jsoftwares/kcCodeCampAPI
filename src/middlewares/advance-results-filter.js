
const advanceResultsFilter = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from query string
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields to delete them from d received query strings; if left they would be treated by mongoose as fields
    removeFields.forEach( param => delete reqQuery[param]);
    
    // Create Query String
    let queryStr = JSON.stringify(reqQuery);    //eg { house: 'true', 'location.state': 'MA' }
    // prepend $ on mongoose operators in query string read from URL so that we can pass it to find()
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Find resources
    query = model.find(JSON.parse(queryStr));
    
    // Select Fields to return
    if (req.query.select) {
        // select query string should a comma separated fields; split() turns it to an array of strings, 
        //then join() converts it to a space separated strings.
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    
    // Sort selected Resources by fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        // if sort is not sent as part of query string we want to always sort by createdAt data. - = DESC
        query = query.sort('-createdAt');
    }

    // Pagination
    /** page received will be string so parseInt cast it to integer. 10 is d radix (base number). if page is not 
     * part of query string, we default it to 1
     */
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    
    query = query.skip(startIndex).limit(limit);

    // Add model to popolate if provided
    if (populate) {
        query = query.populate(populate);
    }
    
    // Executing query
    const results = await query;


    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    // Add data to d RES, so that it is available to any controller that calls this middleware
    res.advanceResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };

    next();
};

module.exports = advanceResultsFilter;