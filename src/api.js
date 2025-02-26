const fetchNodes = async (token, search = '') => {
  console.log('api fetchNodes start', { search });
  const res = await fetch(`/api/nodes?search=${encodeURIComponent(search)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api fetchNodes error', { errorData });
    throw new Error(errorData.error || 'Failed to fetch nodes');
  }
  const data = await res.json();
  console.log('api fetchNodes done', { data });
  return data;
};

const addNode = async (token, title, content) => {
  console.log('api addNode start', { title, content });
  const res = await fetch(`/api/nodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api addNode error', { errorData });
    throw new Error(errorData.error || 'Failed to add node');
  }
  const data = await res.json();
  console.log('api addNode done', { data });
  return data;
};

const getNodeDetails = async (token, nodeId) => {
  console.log('api getNodeDetails start', { nodeId });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api getNodeDetails error', { errorData });
    throw new Error(errorData.error || 'Error fetching node details');
  }
  const data = await res.json();
  console.log('api getNodeDetails done', { data });
  return data;
};

const updateNode = async (token, nodeId, title, content) => {
  console.log('api updateNode start', { nodeId, title, content });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api updateNode error', { errorData });
    throw new Error(errorData.error || 'Failed to update node');
  }
  const data = await res.json();
  console.log('api updateNode done', { data });
  return data;
};

const deleteNode = async (token, nodeId) => {
  console.log('api deleteNode start', { nodeId });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api deleteNode error', { errorData });
    throw new Error(errorData.error || 'Failed to delete node');
  }
  console.log('api deleteNode done');
};

const addEdge = async (token, source, target, label) => {
  console.log('api addEdge start', { source, target, label });
  const res = await fetch(`/api/edges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ source, target, label }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api addEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to add edge');
  }
  const data = await res.json();
  console.log('api addEdge done', { data });
  return data;
};

const updateEdge = async (token, edgeId, label) => {
  console.log('api updateEdge start', { edgeId, label });
  const res = await fetch(`/api/edges/${edgeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api updateEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to update edge');
  }
  const data = await res.json();
  console.log('api updateEdge done', { data });
  return data;
};

const deleteEdge = async (token, edgeId) => {
  console.log('api deleteEdge start', { edgeId });
  const res = await fetch(`/api/edges/${edgeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api deleteEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to delete edge');
  }
  console.log('api deleteEdge done');
};

export default {
  fetchNodes,
  addNode, getNodeDetails, updateNode, deleteNode,
  addEdge, updateEdge, deleteEdge,
};
