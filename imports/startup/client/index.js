import React from 'react';
import { render } from 'react-dom';
import './gql';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import { ApolloResults } from '../../ui/containers/app.jsx';

Meteor.startup(() => {
  render(
    <ApolloResults />,
    document.getElementById('react-root')
  );
});
