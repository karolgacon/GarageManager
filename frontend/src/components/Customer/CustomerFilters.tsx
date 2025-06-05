import React, { useState } from "react";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CustomerFiltersProps {
    onFilterChange: (filters: {
        searchTerm: string;
        status: string;
        loyaltyLevel: string;
    }) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({ onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("");
    const [loyaltyLevel, setLoyaltyLevel] = useState("");

    const handleFilterChange = (field: string, value: string) => {
        let updatedFilters = { searchTerm, status, loyaltyLevel };

        switch (field) {
            case "searchTerm":
                setSearchTerm(value);
                updatedFilters.searchTerm = value;
                break;
            case "status":
                setStatus(value);
                updatedFilters.status = value;
                break;
            case "loyaltyLevel":
                setLoyaltyLevel(value);
                updatedFilters.loyaltyLevel = value;
                break;
        }

        onFilterChange(updatedFilters);
    };

    return (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <TextField
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    sx={{ minWidth: 300, flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Loyalty Level</InputLabel>
                    <Select
                        value={loyaltyLevel}
                        label="Loyalty Level"
                        onChange={(e) => handleFilterChange("loyaltyLevel", e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="vip">VIP (100+ pts)</MenuItem>
                        <MenuItem value="regular">Regular</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Paper>
    );
};

export default CustomerFilters;