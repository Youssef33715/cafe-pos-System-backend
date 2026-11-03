class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    // Apply filtration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // التعديل هنا: بنحول أي قيمة تنفع تبقى رقم سواء كانت لوحدها أو جوه أوبجكت
    const finalQuery = JSON.parse(queryStr, (key, value) => {
      const num = Number(value);
      return !Number.isNaN(num) && typeof value !== "object" ? num : value;
    });
    this.mongooseQuery = this.mongooseQuery.find(finalQuery);

    return this;
  }

  // sort() {
  //   if (this.queryString.sort) {
  //     const sortBy = this.queryString.sort.split(",").join(" ");
  //     this.mongooseQuery = this.mongooseQuery.sort(sortBy);
  //   } else {
  //     this.mongooseQuery = this.mongooseQuery.sort("-createAt");
  //   }
  //   return this;
  // }
  sort() {
    if (this.queryString.sort) {
      // لو الـ sort جاي كـ Array (بسبب التكرار)، حوّله لـ String مفصول بمسافات
      // لو جاي كـ String عادي، هيعمل split و join بشكل طبيعي
      const sortBy =
        typeof this.queryString.sort === "string"
          ? this.queryString.sort.split(",").join(" ")
          : this.queryString.sort.join(" "); // هنا لو Array هيعمل join للـ عناصر علطول

      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt"); //
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === "Products") {
        query.$or = [
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      } else {
        query = { name: { $regex: this.queryString.keyword, $options: "i" } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
