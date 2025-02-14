export async function fetchNodes(token, search = '') {
  const res = await fetch(`/api/nodes?search=${encodeURIComponent(search)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch nodes');
  }
  return await res.json();
}

export async function addNode(token, title, content) {
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
    throw new Error(errorData.error || 'Failed to add node');
  }
  return await res.json();
}

export async function getNodeDetails(token, nodeId) {
  const res = await fetch(`/api/nodes/${nodeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error fetching node details');
  }
  return await res.json();
}

export async function updateNode(token, nodeId, title, content) {
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
    throw new Error(errorData.error || 'Failed to update node');
  }
  return await res.json();
}

export async function deleteNode(token, nodeId) {
  const res = await fetch(`/api/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete node');
  }
  return await res.json();
}

export async function addEdge(token, source, target, label) {
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
    throw new Error(errorData.error || 'Failed to add edge');
  }
  return await res.json();
}

export async function updateEdge(token, edgeId, label) {
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
    throw new Error(errorData.error || 'Failed to update edge');
  }
  return await res.json();
}

export async function deleteEdge(token, edgeId) {
  const res = await fetch(`/api/edges/${edgeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete edge');
  }
  return await res.json();
}
