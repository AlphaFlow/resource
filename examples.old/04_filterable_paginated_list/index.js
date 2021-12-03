import makeTinyapp from '@scriptless/tinyapp';
import App from './src/App';

export default makeTinyapp({
  title: '04_filterable_paginated_list',
  render: () => <App />,
});
