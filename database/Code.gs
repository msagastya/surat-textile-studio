// ── Surat Textile Studio — Google Sheets Database ───────────────────────────
// Deploy as Web App: Execute as "Me", Access "Anyone"
// Sheet columns: ID | Name | SavedAt | FabricType | ZariType | GridW | GridH
//                Tags | PaletteCount | FilledCells | Grid(JSON) | Palette(JSON)

var SHEET_NAME = "Designs";
var COLS = { ID: 0, NAME: 1, SAVED_AT: 2, FABRIC: 3, ZARI: 4,
             GRID_W: 5, GRID_H: 6, TAGS: 7, PALETTE_COUNT: 8,
             FILLED: 9, GRID: 10, PALETTE: 11 };
var TOTAL_COLS = 12;

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["ID","Name","SavedAt","FabricType","ZariType",
                  "GridW","GridH","Tags","PaletteCount","FilledCells",
                  "Grid","Palette"]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TOTAL_COLS).setFontWeight("bold")
      .setBackground("#1a1610").setFontColor("#c8a84b");
  }
  return sh;
}

function cors(output) {
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET handler — list / load ─────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = e.parameter.action || "list";
    var sh = getSheet();
    var data = sh.getDataRange().getValues();

    if (action === "list") {
      var rows = [];
      for (var i = 1; i < data.length; i++) {
        var r = data[i];
        if (!r[COLS.ID]) continue;
        rows.push({
          id:           r[COLS.ID],
          name:         r[COLS.NAME],
          savedAt:      r[COLS.SAVED_AT],
          fabricType:   r[COLS.FABRIC],
          zariType:     r[COLS.ZARI],
          gridW:        r[COLS.GRID_W],
          gridH:        r[COLS.GRID_H],
          tags:         r[COLS.TAGS] ? r[COLS.TAGS].split(",") : [],
          paletteCount: r[COLS.PALETTE_COUNT],
          filledCells:  r[COLS.FILLED],
          palette:      JSON.parse(r[COLS.PALETTE] || "[]"),
          // grid omitted from list for performance
        });
      }
      return cors({ ok: true, designs: rows });
    }

    if (action === "load") {
      var id = e.parameter.id;
      for (var j = 1; j < data.length; j++) {
        if (data[j][COLS.ID] === id) {
          var row = data[j];
          return cors({ ok: true, design: {
            id:           row[COLS.ID],
            name:         row[COLS.NAME],
            savedAt:      row[COLS.SAVED_AT],
            fabricType:   row[COLS.FABRIC],
            zariType:     row[COLS.ZARI],
            gridW:        row[COLS.GRID_W],
            gridH:        row[COLS.GRID_H],
            tags:         row[COLS.TAGS] ? row[COLS.TAGS].split(",") : [],
            paletteCount: row[COLS.PALETTE_COUNT],
            filledCells:  row[COLS.FILLED],
            grid:         JSON.parse(row[COLS.GRID]   || "[]"),
            palette:      JSON.parse(row[COLS.PALETTE] || "[]"),
          }});
        }
      }
      return cors({ ok: false, error: "Design not found" });
    }

    return cors({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return cors({ ok: false, error: err.message });
  }
}

// ── POST handler — save / delete / update ─────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var sh = getSheet();

    if (action === "save") {
      var d = body.design;
      var id = d.id || Utilities.getUuid();
      var now = new Date().toISOString();

      // Check if already exists (update)
      var data = sh.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][COLS.ID] === id) {
          sh.getRange(i + 1, 1, 1, TOTAL_COLS).setValues([[
            id, d.name, now, d.fabricType, d.zariType,
            d.gridW, d.gridH,
            (d.tags || []).join(","),
            d.paletteCount || 0, d.filledCells || 0,
            JSON.stringify(d.grid || []),
            JSON.stringify(d.palette || []),
          ]]);
          return cors({ ok: true, id: id, updated: true });
        }
      }

      // New row
      sh.appendRow([
        id, d.name, now, d.fabricType, d.zariType,
        d.gridW, d.gridH,
        (d.tags || []).join(","),
        d.paletteCount || 0, d.filledCells || 0,
        JSON.stringify(d.grid || []),
        JSON.stringify(d.palette || []),
      ]);
      return cors({ ok: true, id: id, created: true });
    }

    if (action === "delete") {
      var delId = body.id;
      var rows = sh.getDataRange().getValues();
      for (var k = 1; k < rows.length; k++) {
        if (rows[k][COLS.ID] === delId) {
          sh.deleteRow(k + 1);
          return cors({ ok: true, deleted: true });
        }
      }
      return cors({ ok: false, error: "Not found" });
    }

    return cors({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return cors({ ok: false, error: err.message });
  }
}

// ── Health check (GET ?action=ping) ──────────────────────────────────────────
function ping() {
  return cors({ ok: true, message: "Surat Textile Studio DB ready", time: new Date().toISOString() });
}
