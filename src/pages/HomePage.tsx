import React, { useState, useEffect } from "react";
import {
  List, ListItem, ListItemText, ListItemButton,
  Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Typography, AppBar, Toolbar, Box, Paper, TextField,
  InputAdornment, ToggleButton, ToggleButtonGroup, Fab, Chip, Stack, Tooltip
} from "@mui/material";
import { Logout, Search, Sort, CalendarMonth, Add, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";

import { useTodoItemStore } from "../stores/todoStore";
import { useUserStore } from "../stores/userStore";
import { useThemeMode } from "../theme/AppThemeProvider";
import { TodoItem, CreateTodoItem } from "../common/interfaces/TodoItemInterface";

const HomePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<TodoItem | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [completedSort, setCompletedSort] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"list" | "date">("list");

  const { user, logout } = useUserStore();
  const { toggleColorMode } = useThemeMode();

  const {
    todoItems, loadTodoItems, createTodoItem, updateTodoItem, deleteTodoItem,
    bulkCompleteTodos, initializeSignalRConnection, hubConnection
  } = useTodoItemStore();

  useEffect(() => {
    if (!user) return;
    loadTodoItems();
    if (!hubConnection) initializeSignalRConnection();
  }, [user, loadTodoItems, hubConnection, initializeSignalRConnection]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openDetail = (todo: TodoItem) => {
    setCurrentTodo(todo);
    setOpenDetailDialog(true);
  };

  const openEditFromDetail = () => {
    if (!currentTodo) return;
    setTitle(currentTodo.title);
    setDescription(currentTodo.description);
    setOpenEditDialog(true);
  };

  const handleCreateTodo = async () => {
    if (!title || !description || !user) {
      toast.error("Title, description, and login required.");
      return;
    }
    const newTodo: CreateTodoItem = { title, description, createdAt: new Date(), appUserId: user.id };
    await createTodoItem(newTodo);
    setTitle(""); setDescription(""); setOpenCreateDialog(false);
    toast.success("Todo created!");
  };

  const handleUpdateTodo = async () => {
    if (!currentTodo) return;
    await updateTodoItem({ ...currentTodo, title, description });
    setCurrentTodo(null); setOpenEditDialog(false); setOpenDetailDialog(false);
    toast.success("Todo updated!");
  };

  const handleDeleteTodo = async (id: number) => {
    await deleteTodoItem(id);
    toast.info("Todo deleted");
  };

  const handleBulkComplete = async () => {
    if (!selectedIds.length) return toast.info("Select at least one todo.");
    await bulkCompleteTodos(selectedIds);
    setSelectedIds([]);
    toast.success("Selected todos completed");
  };

  const userTodos = todoItems.filter(t => t.appUserId === user?.id);

  const totalTodos = userTodos.length;
  const completedCount = userTodos.filter(t => t.isCompleted).length;
  const uncompletedCount = totalTodos - completedCount;
  const completionRate = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

  const groupTodosByDate = (todos: TodoItem[]) => {
    return todos.reduce((groups: Record<string, TodoItem[]>, todo) => {
      const date = new Date(todo.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(todo);
      return groups;
    }, {});
  };

  const uncompletedTodos = userTodos
    .filter(t => !t.isCompleted && t.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOrder === "asc"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const completedTodos = userTodos
    .filter(t => t.isCompleted)
    .sort((a, b) => completedSort === "asc"
      ? new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
      : new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" sx={{ color: "text.primary", fontWeight: "bold" }}>📋 Todo Dashboard</Typography>
          {user && <Button variant="contained" color="error" startIcon={<Logout />} onClick={logout}>Logout</Button>}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: "1000px", mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
        {!user ? <Typography>Please login to manage your todos.</Typography> : (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <Paper sx={{ p: 2, flex: 1, textAlign: "center" }} elevation={3}>
                <Typography variant="subtitle2">Total Todos</Typography>
                <Typography variant="h4" color="primary">{totalTodos}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: "center" }} elevation={3}>
                <Typography variant="subtitle2">Completed</Typography>
                <Typography variant="h4" color="success.main">{completedCount}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: "center" }} elevation={3}>
                <Typography variant="subtitle2">Uncompleted</Typography>
                <Typography variant="h4" color="warning.main">{uncompletedCount}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: "center" }} elevation={3}>
                <Typography variant="subtitle2">Completion Rate</Typography>
                <Typography variant="h4">{completionRate}%</Typography>
              </Paper>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", mb: 2 }}>
              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
                <ToggleButton value="list">List View</ToggleButton>
                <ToggleButton value="date">Date View</ToggleButton>
              </ToggleButtonGroup>
              {viewMode === "list" && (
                <TextField
                  size="small"
                  placeholder="Search todos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                  sx={{ minWidth: 250 }}
                />
              )}
            </Box>

            {viewMode === "list" && (
              <>
                <Typography variant="h6" mb={1}>Uncompleted Todos</Typography>
                {uncompletedTodos.length === 0 ? <Typography>No uncompleted todos.</Typography> :
                  <List sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {uncompletedTodos.map(item => (
                      <Paper key={item.id} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
                        <Checkbox checked={selectedIds.includes(item.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(item.id)} />
                        <Box sx={{ flex: 1 }} onClick={() => openDetail(item)}>
                          <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                        </Box>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteTodo(item.id)}>Delete</Button>
                      </Paper>
                    ))}
                  </List>
                }
                <Button onClick={handleBulkComplete} disabled={!selectedIds.length} variant="contained" color="success" sx={{ mt: 2 }}>Complete Selected</Button>

                <Box mt={4}>
                  <Typography variant="h6" mb={1}>Completed Todos</Typography>
                  <ToggleButtonGroup size="small" value={completedSort} exclusive onChange={(_, v) => v && setCompletedSort(v)} sx={{ mb: 2 }}>
                    <ToggleButton value="asc"><Sort fontSize="small" /> ↑</ToggleButton>
                    <ToggleButton value="desc"><Sort fontSize="small" /> ↓</ToggleButton>
                  </ToggleButtonGroup>
                  {completedTodos.length === 0 ? <Typography>No completed todos yet.</Typography> :
                    <List sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                      {completedTodos.map(item => (
                        <Paper key={item.id} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#f0fff4" }}>
                          <Typography variant="subtitle1" sx={{ textDecoration: "line-through" }}>{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed at: {item.completedAt ? new Date(item.completedAt).toLocaleString() : "N/A"}
                          </Typography>
                        </Paper>
                      ))}
                    </List>}
                </Box>
              </>
            )}

            {/* Date View */}
            {viewMode === "date" && (
              <>
                {Object.entries(groupTodosByDate(userTodos)).map(([date, todos]) => {
                  const completed = todos.filter(t => t.isCompleted);
                  const uncompleted = todos.filter(t => !t.isCompleted);

                  return (
                    <Box key={date} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>{date}</Typography>

                      {uncompleted.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1">Uncompleted</Typography>
                          <List>
                            {uncompleted.map(todo => (
                              <Paper key={todo.id} sx={{ p: 2, mb: 1, display: "flex", alignItems: "center", "&:hover": { boxShadow: 4 } }}>
                                <Checkbox checked={selectedIds.includes(todo.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(todo.id)} />
                                <Box sx={{ flex: 1 }} onClick={() => openDetail(todo)}>
                                  <Typography variant="subtitle1">{todo.title}</Typography>
                                </Box>
                              </Paper>
                            ))}
                          </List>
                        </Box>
                      )}

                      {completed.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1">Completed</Typography>
                          <List>
                            {completed.map(todo => (
                              <Paper key={todo.id} sx={{ p: 2, mb: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0fff4" }}>
                                <Typography variant="subtitle1" sx={{ textDecoration: "line-through" }}>{todo.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Completed at: {todo.completedAt ? new Date(todo.completedAt).toLocaleString() : "N/A"}
                                </Typography>
                              </Paper>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </>
            )}
          </>
        )}
      </Box>

      {user && <Tooltip title="Add New Todo" arrow>
        <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }} onClick={() => setOpenCreateDialog(true)}><Add /></Fab>
      </Tooltip>}

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Todo</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTodo}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentTodo?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{currentTodo?.description}</DialogContentText>
          <Typography variant="body2" color="text.secondary">
            Created: {currentTodo?.createdAt ? new Date(currentTodo.createdAt).toLocaleString() : "N/A"}
          </Typography>
          {currentTodo?.isCompleted && (
            <Typography variant="body2" color="success.main">
              Completed: {currentTodo.completedAt ? new Date(currentTodo.completedAt).toLocaleString() : "N/A"}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Edit />} onClick={openEditFromDetail}>Edit</Button>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Todo</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTodo}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
