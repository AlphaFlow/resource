const getTodo = async (id: any) => {
  if (!id) throw new Error('Missing id');

  return {
    id,
    title: `Todo ${id}`,
    isCompleted: false,
  };
};

export default getTodo;
