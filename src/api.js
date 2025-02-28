const fetchGraphs = async (token) => {
  console.log('api fetchGraphs start');
  const res = await fetch(`/api/graphs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api fetchGraphs error', { errorData });
    throw new Error(errorData.error || 'Failed to fetch graphs');
  }
  const data = await res.json();
  console.log('api fetchGraphs done', { data });
  return data;
};

const createGraph = async (token, name) => {
  console.log('api createGraph start', { name });
  const res = await fetch(`/api/graphs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api createGraph error', { errorData });
    throw new Error(errorData.error || 'Failed to create graph');
  }
  const data = await res.json();
  console.log('api createGraph done', { data });
  return data;
};

const updateGraph = async (token, graphId, name) => {
  console.log('api updateGraph start', { graphId, name });
  const res = await fetch(`/api/graphs/${graphId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api updateGraph error', { errorData });
    throw new Error(errorData.error || 'Failed to update graph');
  }
  const data = await res.json();
  console.log('api updateGraph done', { data });
  return data;
};

const deleteGraph = async (token, graphId) => {
  console.log('api deleteGraph start', { graphId });
  const res = await fetch(`/api/graphs/${graphId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api deleteGraph error', { errorData });
    throw new Error(errorData.error || 'Failed to delete graph');
  }
  console.log('api deleteGraph done');
};

const fetchNodes = async (token, graphId) => {
  console.log('api fetchNodes start', { graphId });
  const res = await fetch(`/api/graphs/${graphId}/nodes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api fetchNodes error', { errorData });
    throw new Error(errorData.error || 'Failed to fetch nodes');
  }
  const data = await res.json();
  console.log('api fetchNodes done', { data });
  return data;
};

const addNode = async (token, graphId, title, content) => {
  console.log('api addNode start', { graphId, title, content });
  const res = await fetch(`/api/graphs/${graphId}/nodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api addNode error', { errorData });
    throw new Error(errorData.error || 'Failed to add node');
  }
  const data = await res.json();
  console.log('api addNode done', { data });
  return data;
};

const getNodeDetails = async (token, graphId, nodeId) => {
  console.log('api getNodeDetails start', { graphId, nodeId });
  const res = await fetch(`/api/graphs/${graphId}/nodes/${nodeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api getNodeDetails error', { errorData });
    throw new Error(errorData.error || 'Error fetching node details');
  }
  const data = await res.json();
  console.log('api getNodeDetails done', { data });
  return data;
};

const updateNode = async (token, graphId, nodeId, title, content) => {
  console.log('api updateNode start', { graphId, nodeId, title, content });
  const res = await fetch(`/api/graphs/${graphId}/nodes/${nodeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api updateNode error', { errorData });
    throw new Error(errorData.error || 'Failed to update node');
  }
  const data = await res.json();
  console.log('api updateNode done', { data });
  return data;
};

const deleteNode = async (token, graphId, nodeId) => {
  console.log('api deleteNode start', { graphId, nodeId });
  const res = await fetch(`/api/graphs/${graphId}/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api deleteNode error', { errorData });
    throw new Error(errorData.error || 'Failed to delete node');
  }
  console.log('api deleteNode done');
};

const addEdge = async (token, graphId, source, target, label) => {
  console.log('api addEdge start', { graphId, source, target, label });
  const res = await fetch(`/api/graphs/${graphId}/edges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ source, target, label }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api addEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to add edge');
  }
  const data = await res.json();
  console.log('api addEdge done', { data });
  return data;
};

const updateEdge = async (token, graphId, edgeId, label) => {
  console.log('api updateEdge start', { graphId, edgeId, label });
  const res = await fetch(`/api/graphs/${graphId}/edges/${edgeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api updateEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to update edge');
  }
  const data = await res.json();
  console.log('api updateEdge done', { data });
  return data;
};

const deleteEdge = async (token, graphId, edgeId) => {
  console.log('api deleteEdge start', { graphId, edgeId });
  const res = await fetch(`/api/graphs/${graphId}/edges/${edgeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error('api deleteEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to delete edge');
  }
  console.log('api deleteEdge done');
};

export default {
  fetchGraphs,
  createGraph, updateGraph, deleteGraph, fetchNodes,
  addNode, getNodeDetails, updateNode, deleteNode,
  addEdge, updateEdge, deleteEdge,
};
