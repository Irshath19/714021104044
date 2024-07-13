const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

const ecommCompanies = ['AMZ', 'FWR', 'CRT', 'EX', 'SUP'];

const fetchProducts = async (company, category, minPrice, maxPrice) => {
  try {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products/top?minPrice=${minPrice}&maxPrice=${maxPrice}`, { timeout: 500 });
    return response.data.map(product => ({
      ...product,
      id: uuidv4()
    }));
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    return [];
  }
};

app.get('/categories/:category/products', async (req, res) => {
  const { category } = req.params;
  const { n = 10, page = 1, minPrice = 0, maxPrice = Infinity, sort, order = 'asc' } = req.query;

  let products = [];
  for (const company of ecommCompanies) {
    const companyProducts = await fetchProducts(company, category, minPrice, maxPrice);
    products = [...products, ...companyProducts];
  }

  if (sort) {
    products.sort((a, b) => {
      if (order === 'asc') {
        return a[sort] > b[sort] ? 1 : -1;
      } else {
        return a[sort] < b[sort] ? 1 : -1;
      }
    });
  }

  const startIndex = (page - 1) * n;
  const endIndex = startIndex + parseInt(n);
  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json(paginatedProducts);
});

app.get('/categories/:category/products/:productId', (req, res) => {
  const { productId } = req.params;
  const product = products.find(p => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});