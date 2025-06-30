sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/FilterController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/model/Sorter",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/m/table/ColumnWidthController",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    Engine,
    SelectionController,
    SortController,
    GroupController,
    FilterController,
    MetadataHelper,
    Sorter,
    ColumnListItem,
    Text,
    coreLibrary,
    ColumnWidthController,
    Filter,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Overview", {
      onInit: function () {
        this._oTable = this.byId("ordersTable");
        this._registerForP13n();
        MessageToast.show("Overview loaded", {
          duration: 2000,
          at: "center center",
        });
      },
      onSearchOrders: function (oEvent) {
        const sQuery = oEvent.getSource().getValue().trim();
        const oTable = this.byId("ordersTable");
        const oBinding = oTable.getBinding("items");

        if (!sQuery) {
          oBinding.filter([]);
          return;
        }

        const aFilters = [];
        const Filter = sap.ui.model.Filter;
        const FilterOperator = sap.ui.model.FilterOperator;

        // Filter string fields using Contains
        aFilters.push(
          new Filter("ShipCountry", FilterOperator.Contains, sQuery)
        );
        aFilters.push(
          new Filter("Customer/CompanyName", FilterOperator.Contains, sQuery)
        );

        // Filter numeric fields using EQ (only if the input is numeric)
        if (!isNaN(sQuery)) {
          aFilters.push(
            new Filter("OrderID", FilterOperator.EQ, parseInt(sQuery, 10))
          );
          aFilters.push(
            new Filter("Freight", FilterOperator.EQ, parseFloat(sQuery))
          );
        }

        const oCombinedFilter = new Filter({
          filters: aFilters,
          and: false, // OR logic
        });

        oBinding.filter(oCombinedFilter);
      },
      _registerForP13n: function () {
        const oTable = this._oTable;
        this.oMetadataHelper = new MetadataHelper([
          { key: "OrderID_col", label: "Order ID", path: "OrderID" },
          {
            key: "Customer_col",
            label: "Customer",
            path: "Customer/CompanyName",
          },
          { key: "OrderDate_col", label: "Order Date", path: "OrderDate" },
          {
            key: "ShipCountry_col",
            label: "Ship Country",
            path: "ShipCountry",
          },
          { key: "Freight_col", label: "Freight", path: "Freight" },
        ]);

        Engine.getInstance().register(oTable, {
          helper: this.oMetadataHelper,
          controller: {
            Columns: new SelectionController({
              targetAggregation: "columns",
              control: oTable,
            }),
            Sorter: new SortController({
              control: oTable,
            }),
            Groups: new GroupController({
              control: oTable,
            }),
            ColumnWidth: new ColumnWidthController({
              control: oTable,
            }),
            Filter: new FilterController({
              control: oTable,
            }),
          },
        });

        Engine.getInstance().attachStateChange(
          this.handleStateChange.bind(this)
        );
      },

      openPersoDialog: function (oEvt) {
        this._openPersoDialog(
          ["Columns", "Sorter", "Groups", "Filter"],
          oEvt.getSource()
        );
      },

      _openPersoDialog: function (aPanels, oSource) {
        const oTable = this._oTable;
        Engine.getInstance().show(oTable, aPanels, {
          contentHeight: aPanels.length > 1 ? "50rem" : "35rem",
          contentWidth: aPanels.length > 1 ? "45rem" : "32rem",
          source: oSource || oTable,
        });
      },

      handleStateChange: function (oEvt) {
        console.log("State change triggered:", oEvt.getParameter("state"));
        const oTable = this._oTable;
        const oState = oEvt.getParameter("state");

        if (!oState) {
          return;
        }

        // Update columns
        this.updateColumns(oState);

        // Create filters, groups, sorters
        const aFilter = this.createFilters(oState);
        const aGroups = this.createGroups(oState);
        const aSorter = this.createSorters(oState, aGroups);

        // Create dynamic cells
        const aCells = oState.Columns.map((oColumnState) => {
          return new Text({
            text:
              "{" +
              this.oMetadataHelper.getProperty(oColumnState.key).path +
              "}",
          });
        });

        oTable.bindItems({
          templateShareable: false,
          path: "/Orders",
          parameters: { expand: "Customer" },
          sorter: aSorter.concat(aGroups),
          filters: aFilter,
          template: new ColumnListItem({
            type: "Navigation",
            press: this.onRowPress.bind(this),
            cells: aCells,
          }),
        });
      },

      onRowPress: function (oEvent) {
        const oCtx = oEvent.getSource().getBindingContext();
        const sOrderID = oCtx.getProperty("OrderID");
        this.getOwnerComponent().getRouter().navTo("detail", {
          OrderID: sOrderID,
        });
      },

      createFilters: function (oState) {
        const aFilter = [];
        Object.keys(oState.Filter).forEach((sFilterKey) => {
          const filterPath = this.oMetadataHelper.getProperty(sFilterKey).path;
          oState.Filter[sFilterKey].forEach(function (oCondition) {
            aFilter.push(
              new Filter(filterPath, oCondition.operator, oCondition.values[0])
            );
          });
        });
        this.byId("filterInfo").setVisible(aFilter.length > 0);
        return aFilter;
      },

      createSorters: function (oState, aExistingSorter) {
        const aSorter = aExistingSorter || [];
        if (oState.Sorter) {
          oState.Sorter.forEach((oSorter) => {
            const oProperty = this.oMetadataHelper.getProperty(oSorter.key);
            if (oProperty) {
              aSorter.push(new Sorter(oProperty.path, oSorter.descending));
              console.log(
                "Added sorter for:",
                oProperty.path,
                "Descending:",
                oSorter.descending
              );
            } else {
              console.warn("No property found for key:", oSorter.key);
            }
          });
        }
        return aSorter;
      },

      createGroups: function (oState) {
        const aGroups = [];
        if (oState.Groups) {
          oState.Groups.forEach((oGroup) => {
            const oProperty = this.oMetadataHelper.getProperty(oGroup.key);
            if (oProperty) {
              aGroups.push(
                new Sorter(
                  oProperty.path,
                  false, // Grouping is typically not descending
                  true // Group by this property
                )
              );
              console.log("Added group for:", oProperty.path);
            } else {
              console.warn("No property found for key:", oGroup.key);
            }
          });
        }
        return aGroups;
      },

      updateColumns: function (oState) {
        const oTable = this._oTable;
        oTable.getColumns().forEach((oColumn) => {
          oColumn.setVisible(false);
          oColumn.setSortIndicator(coreLibrary.SortOrder.None);
        });
        oState.Columns.forEach((oProp, iIndex) => {
          const oCol = oTable
            .getColumns()
            .find((oColumn) => oColumn.data("p13nKey") === oProp.key);
          oCol.setVisible(true);
          oTable.removeColumn(oCol);
          oTable.insertColumn(oCol, iIndex);
        });
      },

      beforeOpenColumnMenu: function (oEvt) {
        const oMenu = this.byId("menu");
        const oColumn = oEvt.getParameter("openBy");
        const oSortItem = oMenu.getQuickActions()[0].getItems()[0];
        const oGroupItem = oMenu.getQuickActions()[1].getItems()[0];
        oSortItem.setKey(oColumn.data("p13nKey"));
        oSortItem.setLabel(oColumn.getHeader().getText());
        oGroupItem.setKey(oColumn.data("p13nKey"));
        oGroupItem.setLabel(oColumn.getHeader().getText());
      },
      onSort: function (oEvt) {
        const oSortItem = oEvt.getParameter("item");
        const oTable = this._oTable;
        const sKey = oSortItem.getKey();
        const sOrder = oSortItem.getSortOrder();

        Engine.getInstance()
          .retrieveState(oTable)
          .then(function (oState) {
            oState.Sorter = []; // Clear existing
            if (sOrder !== coreLibrary.SortOrder.None) {
              oState.Sorter.push({
                key: sKey,
                descending: sOrder === coreLibrary.SortOrder.Descending,
              });
            }
            Engine.getInstance().applyState(oTable, oState);
          });
      },

      onGroup: function (oEvt) {
        const oGroupItem = oEvt.getParameter("item");
        const oTable = this._oTable;
        const sKey = oGroupItem.getKey();

        Engine.getInstance()
          .retrieveState(oTable)
          .then(function (oState) {
            oState.Groups = []; // Clear existing
            if (oGroupItem.getGrouped()) {
              oState.Groups.push({ key: sKey });
            }
            Engine.getInstance().applyState(oTable, oState);
          });
      },
      onFilterInfoPress: function (oEvt) {
        this._openPersoDialog(["Filter"], oEvt.getSource());
      },

      onClearFilterPress: function (oEvt) {
        const oTable = this._oTable;
        Engine.getInstance()
          .retrieveState(oTable)
          .then(function (oState) {
            for (var sKey in oState.Filter) {
              oState.Filter[sKey].forEach((condition) => {
                condition.filtered = false;
              });
            }
            Engine.getInstance().applyState(oTable, oState);
          });
      },
    });
  }
);
