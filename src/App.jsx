/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import classNames from 'classnames';

import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    ({ id }) => id === product.categoryId,
  );
  const user = usersFromServer.find(({ id }) => id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

function prepareProductsForOutput(
  prods,
  { selectedUser, queryName, selectedCategories, sortField },
) {
  let prodsCopy = [...prods];

  if (selectedUser !== 'All') {
    prodsCopy = prodsCopy.filter(({ user }) => user.name === selectedUser);
  }

  if (queryName !== '') {
    prodsCopy = prodsCopy.filter(({ name }) =>
      name.toLowerCase().includes(queryName.toLowerCase()),
    );
  }

  if (selectedCategories.length !== 0) {
    prodsCopy = prodsCopy.filter(({ category }) =>
      selectedCategories.includes(category.title),
    );
  }

  if (sortField !== '') {
    switch (sortField) {
      case 'ID':
        prodsCopy.sort((prod1, prod2) => prod1.id - prod2.id);
        break;

      case 'Product':
        prodsCopy.sort((prod1, prod2) => prod1.name.localeCompare(prod2.name));
        break;

      case 'Category':
        prodsCopy.sort((prod1, prod2) =>
          prod1.category.title.localeCompare(prod2.category.title),
        );
        break;

      case 'User':
        prodsCopy.sort((prod1, prod2) =>
          prod1.user.name.localeCompare(prod2.user.name),
        );
        break;

      default:
        break;
    }
  }

  return prodsCopy;
}

export const App = () => {
  const [selectedUser, setSelectedUser] = useState('All');
  const [queryName, setQueryName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState('');
  const preparedProducts = prepareProductsForOutput(products, {
    selectedUser,
    queryName,
    selectedCategories,
    sortField,
  });

  const resetAll = () => {
    setSelectedUser('All');
    setSelectedCategories([]);
    setQueryName('');
    setSortField('');
  };

  const enableCategory = title => {
    if (selectedCategories.includes(title)) {
      setSelectedCategories(
        selectedCategories.filter(category => category !== title),
      );
    } else {
      setSelectedCategories([...selectedCategories, title]);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                onClick={() => setSelectedUser('All')}
                data-cy="FilterAllUsers"
                href="#/"
                className={classNames({
                  'is-active': selectedUser === 'All',
                })}
              >
                All
              </a>

              {usersFromServer.map(({ id, name }) => (
                <a
                  key={id}
                  onClick={() => setSelectedUser(name)}
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames({
                    'is-active': selectedUser === name,
                  })}
                >
                  {name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  onChange={event => setQueryName(event.target.value)}
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={queryName}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {queryName !== '' && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      onClick={() => setQueryName('')}
                      type="button"
                      className="delete"
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                onClick={() => setSelectedCategories([])}
                href="#/"
                data-cy="AllCategories"
                className={classNames('button', 'is-success', 'mr-6', {
                  'is-outlined': selectedCategories.length !== 0,
                })}
              >
                All
              </a>

              {categoriesFromServer.map(({ id, title }) => (
                <a
                  key={id}
                  data-cy="Category"
                  onClick={() => enableCategory(title)}
                  className={classNames('button', 'mr-2', 'my-1', {
                    'is-info': selectedCategories.includes(title),
                  })}
                  href="#/"
                >
                  {title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                onClick={resetAll}
                href="#/"
                className="button is-link is-outlined is-fullwidth"
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">No results</p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {['ID', 'Product', 'Category', 'User'].map(column => (
                    <th key={column}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}
                        <a onClick={() => setSortField(column)} href="#/">
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preparedProducts.map(({ id, name, category, user }) => (
                  <tr key={id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {id}
                    </td>

                    <td data-cy="ProductName">{name}</td>
                    <td data-cy="ProductCategory">{`${category.icon} - ${category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={classNames('has-text-link', {
                        'has-text-danger': user.sex === 'f',
                      })}
                    >
                      {user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
