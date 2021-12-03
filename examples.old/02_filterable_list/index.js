import makeTinyapp from '@scriptless/tinyapp';
import App from './src/App';

export default makeTinyapp({
  title: 'examples/filterable-list',
  render: () => <App />,
});
