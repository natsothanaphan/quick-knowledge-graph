export async function fetchNodes(token, search = '') {
  console.log('api.js fetchNodes start', { search });
  const res = await fetch(`/api/nodes?search=${encodeURIComponent(search)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js fetchNodes error', { errorData });
    throw new Error(errorData.error || 'Failed to fetch nodes');
  }
  const data = await res.json();
  console.log('api.js fetchNodes', { data });
  return data;
}

export async function addNode(token, title, content) {
  console.log('api.js addNode start', { title, content });
  const res = await fetch(`/api/nodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js addNode error', { errorData });
    throw new Error(errorData.error || 'Failed to add node');
  }
  const data = await res.json();
  console.log('api.js addNode', { data });
  return data;
}

export async function getNodeDetails(token, nodeId) {
  console.log('api.js getNodeDetails start', { nodeId });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js getNodeDetails error', { errorData });
    throw new Error(errorData.error || 'Error fetching node details');
  }
  const data = await res.json();
  console.log('api.js getNodeDetails', { data });
  return data;
}

export async function updateNode(token, nodeId, title, content) {
  console.log('api.js updateNode start', { nodeId, title, content });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js updateNode error', { errorData });
    throw new Error(errorData.error || 'Failed to update node');
  }
  const data = await res.json();
  console.log('api.js updateNode', { data });
  return data;
}

export async function deleteNode(token, nodeId) {
  console.log('api.js deleteNode start', { nodeId });
  const res = await fetch(`/api/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js deleteNode error', { errorData });
    throw new Error(errorData.error || 'Failed to delete node');
  }
  const data = await res.json();
  console.log('api.js deleteNode', { data });
  return data;
}

export async function addEdge(token, source, target, label) {
  console.log('api.js addEdge start', { source, target, label });
  const res = await fetch(`/api/edges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ source, target, label })
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js addEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to add edge');
  }
  const data = await res.json();
  console.log('api.js addEdge', { data });
  return data;
}

export async function updateEdge(token, edgeId, label) {
  console.log('api.js updateEdge start', { edgeId, label });
  const res = await fetch(`/api/edges/${edgeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ label })
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js updateEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to update edge');
  }
  const data = await res.json();
  console.log('api.js updateEdge', { data });
  return data;
}

export async function deleteEdge(token, edgeId) {
  console.log('api.js deleteEdge start', { edgeId });
  const res = await fetch(`/api/edges/${edgeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.log('api.js deleteEdge error', { errorData });
    throw new Error(errorData.error || 'Failed to delete edge');
  }
  const data = await res.json();
  console.log('api.js deleteEdge', { data });
  return data;
}
