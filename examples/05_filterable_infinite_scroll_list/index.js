import makeTinyapp from '@scriptless/tinyapp';
import App from './src/App';

export default makeTinyapp({
  title: '05_filterable_infinite_scroll_list',
  render: () => <App />,
});
