// Truck Management System - Supabase Integration
// Table: vwtm_truck_management

// Global functions for HTML onclick handlers
function openExcelModal() {
    if (window.truckSystem) {
        window.truckSystem.openExcelModal();
    } else {
        console.error('❌ Truck system not available, attempting to create...');
        // Try to create the system if it doesn't exist
        try {
            console.log('🔄 Creating Truck Management System...');
            window.truckSystem = new TruckManagementSystem();
            console.log('✅ Truck system created, now opening modal...');
            setTimeout(() => {
                if (window.truckSystem) {
                    window.truckSystem.openExcelModal();
                } else {
                    console.warn('⚠️ Failed to initialize truck system. Please refresh the page.');
                }
            }, 100);
        } catch (error) {
            console.error('❌ Failed to create truck system:', error);
            console.warn('⚠️ Failed to initialize truck system: ' + error.message);
        }
    }
}

function closeExcelModal() {
    if (window.truckSystem) {
        window.truckSystem.closeExcelModal();
    }
}

function updateModalTable() {
    if (window.truckSystem) {
        window.truckSystem.updateModalTable();
    }
}

function setTodayDate() {
    if (window.truckSystem) {
        window.truckSystem.setTodayDate();
    }
}

function saveAllTrucks() {
    if (window.truckSystem) {
        window.truckSystem.saveAllTrucks();
    }
}

function clearModalTable() {
    if (window.truckSystem) {
        window.truckSystem.clearModalTable();
    }
}

// Check if class already exists to prevent duplicate declaration
if (typeof window.TruckManagementSystem === 'undefined') {
    window.TruckManagementSystem = class TruckManagementSystem {
    constructor() {
        this.currentHotTable = null;
        this.truckData = [];
        this.supabase = window.sb;
        this.init();
    }

    async init() {
        console.log('🚛 Truck Management System initializing...');
        
        try {
            // Check if Supabase is available
            if (!this.supabase) {
                console.warn('⚠️ Supabase not available yet, will retry in 1 second');
                // Retry initialization after 1 second
                setTimeout(() => this.init(), 1000);
                return;
            }

            // Load initial data
            await this.loadTrucksFromDatabase();
            this.setTodayDate();
            this.loadCurrentTrucks();
            
            console.log('✅ Truck Management System initialized');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            // Even if there's an error, mark as initialized so functions can work
            console.log('⚠️ System marked as ready despite errors');
        }
    }

    // Set today's date in the modal
    setTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = year + '-' + month + '-' + day;
        
        const modalDate = document.getElementById('modalDate');
        if (modalDate) {
            modalDate.value = todayString;
        }
    }

    // Open Excel-style modal
    async openExcelModal() {
        try {
            console.log('🚛 Opening Excel modal...');
            
            // First, just try to show the modal without Handsontable check
            const modal = document.getElementById('excelModal');
            if (modal) {
                modal.style.display = 'block';
                console.log('✅ Modal displayed');
                
                // Set today's date
                this.setTodayDate();
                
                // Check if Handsontable is available
                if (typeof Handsontable === 'undefined') {
                    console.warn('⚠️ Handsontable not available yet, will retry in 500ms');
                    setTimeout(() => {
                        this.updateModalTable();
                    }, 500);
                } else {
                    console.log('✅ Handsontable is available, proceeding...');
                    setTimeout(() => {
                        this.updateModalTable();
                    }, 100);
                }
            } else {
                console.error('❌ Modal element not found');
                console.warn('⚠️ Modal element not found. Please refresh the page.');
            }
        } catch (error) {
            console.error('Error in openExcelModal:', error);
            console.warn('⚠️ Error opening modal: ' + error.message);
        }
    }

    // Close Excel modal
    closeExcelModal() {
        const modal = document.getElementById('excelModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

         // Update modal table
     updateModalTable() {
         const selectedDate = document.getElementById('modalDate').value;
         if (!selectedDate) {
             const displayElement = document.getElementById('modalDisplayDate');
             if (displayElement) {
                 displayElement.textContent = 'Please select a date';
             }
             return;
         }

         const displayElement = document.getElementById('modalDisplayDate');
         if (displayElement) {
             displayElement.textContent = selectedDate;
         }
         
         // 기존 Handsontable이 있으면 데이터만 업데이트, 없으면 새로 생성
         if (this.currentHotTable) {
             console.log('📊 Updating existing Handsontable with new date data...');
             this.updateExistingHandsontable(selectedDate);
         } else {
             console.log('📊 Creating new Handsontable...');
             this.createHandsontable(selectedDate);
         }
     }

    // Create Handsontable
    createHandsontable(selectedDate) {
        try {
            console.log('📊 Creating Handsontable for date:', selectedDate);
            
            // Check if Handsontable is available
            if (typeof Handsontable === 'undefined') {
                console.error('❌ Handsontable not available');
                const container = document.getElementById('modalTruckTable');
                if (container) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Handsontable library is loading... Please wait.</div>';
                }
                return;
            }
            
            // Get container and check if it's ready
            const container = document.getElementById('modalTruckTable');
            if (!container) {
                console.error('❌ Container not found');
                return;
            }
            
            // Clear existing table
            container.innerHTML = '';
            
            // Get existing data for this date
            const existingData = this.truckData.filter(truck => truck.departure_date === selectedDate);
            
            // Create sample data structure
            const sampleData = this.createSampleData(existingData);
            
            // Create Handsontable with error handling
            try {
                this.currentHotTable = new Handsontable(container, {
                    data: sampleData,
                    colHeaders: ['ETD Time*', 'Delivery No*', 'Destination*', 'Truck ID*', 'Forza/Brown ID*', 'Parts* (예: PartA(5) + PartB(3))', 'PAGER', 'Status'],
                                         columns: [
                         { 
                             data: 0, 
                             type: 'dropdown',
                             source: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'],
                             className: 'htCenter htMiddle',
                             width: 100
                         },
                         { data: 1, className: 'htCenter htMiddle', width: 120 },
                         { 
                             data: 2, 
                             type: 'dropdown',
                             source: ['VW US', 'VW MX', 'KMX', 'VX US'],
                             className: 'htCenter htMiddle',
                             allowInvalid: false,
                             strict: true,
                             width: 100
                         },
                         { data: 3, className: 'htCenter htMiddle', width: 100 },
                         { data: 4, className: 'htCenter htMiddle', width: 120 },
                         { data: 5, className: 'htCenter htMiddle', width: 200 },
                         { 
                             data: 6, 
                             className: 'htCenter htMiddle',
                             type: 'text',
                             allowInvalid: true,
                             width: 80,
                             validator: function(value, callback) {
                                 // Allow any text input for PAGER
                                 callback(true);
                             }
                         },
                         { 
                             data: 7, 
                             type: 'dropdown',
                             source: ['Scheduled', 'On Site', 'Shipped', 'Delayed', 'Cancelled'],
                             className: 'htCenter htMiddle',
                             width: 100
                         }
                     ],
                    rowHeaders: true,
                    colWidths: [100, 120, 100, 100, 120, 200, 80, 100],
                    height: 400,
                    licenseKey: 'non-commercial-and-evaluation',
                    stretchH: 'all',
                    autoWrapRow: true,
                    contextMenu: true,
                    manualRowResize: true,
                    manualColumnResize: true,
                    filters: true,
                    dropdownMenu: true,
                    // 기존 시스템과 동일한 자동 시간 증가 기능
                    beforeChange: (changes, source) => {
                        // Only handle ETD Time changes from user input
                        if (source === 'edit' && changes && changes.length > 0) {
                            changes.forEach(change => {
                                const row = change[0];
                                const prop = change[1];
                                const oldValue = change[2];
                                const newValue = change[3];
                                
                                                                 // Only process ETD Time column changes (index 0)
                                 if (prop === 0 && oldValue !== newValue && newValue) {
                                    // Schedule auto-fill after the current change is complete
                                    setTimeout(() => {
                                        try {
                                            // Get the current table instance
                                            const table = this.currentHotTable;
                                            if (!table) return;
                                            
                                            // Auto-fill subsequent rows with +1 hour increments
                                            const timeOptions = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
                                            const currentIndex = timeOptions.indexOf(newValue);
                                            
                                            if (currentIndex !== -1) {
                                                // Fill next 5 rows with +1 hour increments
                                                for (let i = 1; i <= 5 && (row + i) < table.countRows(); i++) {
                                                    const nextIndex = (currentIndex + i) % 24;
                                                    const nextTime = timeOptions[nextIndex];
                                                    
                                                    // Use setDataAtCell with 'loadData' source to avoid triggering events
                                                    table.setDataAtCell(row + i, 0, nextTime, 'loadData');
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Error during auto-fill:', error);
                                        }
                                    }, 100);
                                }
                                
                                                                 // Special handling for PAGER field (index 6) to ensure keyboard reliability
                                 if (prop === 6) {
                                    console.log('📱 PAGER field changed:', oldValue, '->', newValue);
                                    
                                    // Auto-update status to 'On Site' when PAGER is filled
                                    if (newValue && newValue.trim() !== '' && oldValue !== newValue) {
                                        // Get the current table instance from the context
                                        const currentTable = this.currentHotTable;
                                        if (currentTable) {
                                                                                         const currentStatus = currentTable.getDataAtCell(row, 7); // Status column (index 7)
                                             if (currentStatus !== 'Shipped') {
                                                 // Update status to 'On Site' automatically
                                                 currentTable.setDataAtCell(row, 7, 'On Site', 'loadData');
                                                console.log(`🔄 Auto-updated status to 'On Site' for row ${row} (PAGER filled)`);
                                                
                                                // Show user feedback
                                                setTimeout(() => {
                                                    this.showStatus(`PAGER 입력으로 인해 ${row + 1}행의 상태가 자동으로 'On Site'로 변경되었습니다`, 'info');
                                                }, 500);
                                            } else {
                                                console.log(`ℹ️ Status not changed for row ${row} (already Shipped)`);
                                            }
                                        }
                                    }
                                    
                                    // Force focus to ensure keyboard appears
                                    setTimeout(() => {
                                        try {
                                            const currentTable = this.currentHotTable;
                                            if (currentTable) {
                                                currentTable.selectCell(row, prop);
                                            }
                                        } catch (error) {
                                            console.error('Error focusing PAGER field:', error);
                                        }
                                    }, 50);
                                }
                            });
                        }
                        
                        // Always allow the change
                        return true;
                    },
                                         afterChange: (changes, source) => {
                         // 자동 저장 비활성화 - SAVE ALL TRUCKS 버튼을 통해서만 저장
                         if (source === 'edit' && changes && changes.length > 0) {
                             console.log('📝 Data changed, but auto-save is disabled. Use SAVE ALL TRUCKS button to save.');
                             
                             // 사용자에게 저장이 필요하다는 알림 표시
                             this.showStatus('💾 데이터가 변경되었습니다. 저장하려면 SAVE ALL TRUCKS 버튼을 클릭하세요.', 'info');
                         }
                     }
                });

                console.log('✅ Handsontable created successfully');
                
                // Show user tip about auto-fill feature
                setTimeout(() => {
                    this.showStatus('💡 기본 셋팅: 1행(07:00), 3행(09:00), 5행(11:00), 7행(13:00) VW US, 8행부터 14:00 VW MX로 +1시간씩 자동 설정됩니다. 시간 변경 시 다음 5개 행이 자동으로 +1시간씩 채워집니다. 📱 PAGER 입력 시 자동으로 Status가 On Site로 변경됩니다. 🎯 Destination은 VW US, VW MX, KMX, VX US만 허용됩니다.', 'info');
                }, 1000);
                
            } catch (error) {
                console.error('❌ Error creating Handsontable:', error);
                if (container) {
                    container.innerHTML = `<div style="padding: 20px; text-align: center; color: #e74c3c;">Error creating table: ${error.message}</div>`;
                }
            }
        } catch (error) {
            console.error('❌ Error in createHandsontable:', error);
                 }
     }

     // Update existing Handsontable with new date data
     updateExistingHandsontable(selectedDate) {
         try {
             console.log('📊 Updating existing Handsontable for date:', selectedDate);
             
             if (!this.currentHotTable) {
                 console.error('❌ No existing Handsontable to update');
                 return;
             }
             
             // Get existing data for this date
             const existingData = this.truckData.filter(truck => truck.departure_date === selectedDate);
             
             // Create sample data structure (기존 데이터 + 새 행들)
             const sampleData = this.createSampleData(existingData);
             
             // 기존 테이블에 새 데이터 로드 (기존 편집 내용 유지)
             this.currentHotTable.loadData(sampleData);
             
             console.log('✅ Existing Handsontable updated successfully');
             
         } catch (error) {
             console.error('❌ Error updating existing Handsontable:', error);
         }
     }

          // Create sample data - 완전히 새로 작성
       createSampleData(existingData) {
           try {
               console.log('📊 Creating sample data...');
               
               // 기존 데이터가 있으면 변환
               if (existingData && existingData.length > 0) {
                   console.log('📊 Converting existing data:', existingData.length, 'rows');
                   
                   const convertedData = existingData.map((truck, index) => {
                       // 각 필드를 안전하게 변환
                       const row = [
                           truck.departure_time || '',           // ETD Time (index 0)
                           truck.delivery_no || '',              // Delivery No (index 1)
                           truck.destination || 'VW US',         // Destination (index 2)
                           truck.truck_id || '',                 // Truck ID (index 3)
                           truck.forza_id || '',                 // Forza ID (index 4)
                           truck.parts || '',                    // Parts (index 5)
                           truck.pager_no || '',                 // PAGER (index 6)
                           truck.status || 'Scheduled'           // Status (index 7)
                       ];
                       
                       // 모든 값을 문자열로 변환하고 공백 제거
                       return row.map(cell => String(cell || '').trim());
                   });
                   
                   // 기존 데이터가 24행보다 적으면 빈 행들을 추가
                   while (convertedData.length < 24) {
                       const newRowIndex = convertedData.length;
                       let time = '';
                       let destination = 'VW US';
                       
                       // 특정 행에 시간 설정
                       if (newRowIndex === 0) {        // 1행: 07:00
                           time = '07:00';
                       } else if (newRowIndex === 2) { // 3행: 09:00
                           time = '09:00';
                       } else if (newRowIndex === 4) { // 5행: 11:00
                           time = '11:00';
                       } else if (newRowIndex === 6) { // 7행: 13:00
                           time = '13:00';
                       } else if (newRowIndex === 7) { // 8행: 14:00
                           time = '14:00';
                           destination = 'VW MX';
                       } else if (newRowIndex > 7) {   // 9행부터: 15:00, 16:00...
                           const hour = 14 + (newRowIndex - 7);
                           if (hour >= 24) {
                               time = String(hour - 24).padStart(2, '0') + ':00';
                           } else {
                               time = String(hour).padStart(2, '0') + ':00';
                           }
                           destination = 'VW MX';
                       }
                       
                       // 새 빈 행 추가
                       const newRow = [
                           time,           // ETD Time (index 0)
                           '',             // Delivery No (index 1) - 빈 값
                           destination,    // Destination (index 2)
                           '',             // Truck ID (index 3) - 빈 값
                           '',             // Forza ID (index 4) - 빈 값
                           '',             // Parts (index 5) - 빈 값
                           '',             // PAGER (index 6) - 빈 값
                           'Scheduled'     // Status (index 7) - 기본값
                       ];
                       
                       convertedData.push(newRow);
                   }
                   
                   console.log('✅ Converted existing data + added empty rows:', convertedData.length, 'rows');
                   return convertedData;
               }
              
              // 새 데이터 생성 (24행)
              console.log('📊 Creating new sample data: 24 rows');
              
              const data = [];
              const timeOptions = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
              
              for (let i = 0; i < 24; i++) {
                  let time = '';
                  let destination = 'VW US';
                  
                  // 특정 행에 시간 설정
                  if (i === 0) {        // 1행: 07:00
                      time = '07:00';
                  } else if (i === 2) { // 3행: 09:00
                      time = '09:00';
                  } else if (i === 4) { // 5행: 11:00
                      time = '11:00';
                  } else if (i === 6) { // 7행: 13:00
                      time = '13:00';
                  } else if (i === 7) { // 8행: 14:00
                      time = '14:00';
                      destination = 'VW MX';
                  } else if (i > 7) {   // 9행부터: 15:00, 16:00...
                      const hour = 14 + (i - 7);
                      if (hour >= 24) {
                          time = String(hour - 24).padStart(2, '0') + ':00';
                      } else {
                          time = String(hour).padStart(2, '0') + ':00';
                      }
                      destination = 'VW MX';
                  }
                  
                  // 행 데이터 생성
                  const row = [
                      time,           // ETD Time (index 0)
                      '',             // Delivery No (index 1) - 빈 값
                      destination,    // Destination (index 2)
                      '',             // Truck ID (index 3) - 빈 값
                      '',             // Forza ID (index 4) - 빈 값
                      '',             // Parts (index 5) - 빈 값
                      '',             // PAGER (index 6) - 빈 값
                      'Scheduled'     // Status (index 7) - 기본값
                  ];
                  
                  data.push(row);
              }
              
              console.log('✅ Created new sample data:', data.length, 'rows');
              console.log('📊 Sample data preview:', data.slice(0, 3));
              
              return data;
              
          } catch (error) {
              console.error('❌ Error in createSampleData:', error);
              // 에러 발생 시 기본 데이터 반환
              return [
                  ['07:00', '', 'VW US', '', '', '', '', 'Scheduled'],
                  ['', '', 'VW US', '', '', '', '', 'Scheduled'],
                  ['09:00', '', 'VW US', '', '', '', '', 'Scheduled']
              ];
          }
      }

    // Save table data to database
    async saveTableData() {
        try {
            if (!this.currentHotTable) return;
            
            const selectedDate = document.getElementById('modalDate').value;
            const data = this.currentHotTable.getData();
            
            const validDestinations = ['VW US', 'VW MX', 'KMX', 'VX US'];
            
                         // Filter valid rows first, then map to data structure
             const trucksToSave = data
                 .filter((row, index) => {
                     // Only save rows where DELIVERY NO (index 1) is not empty
                     if (!row[1] || row[1].toString().trim() === '') {
                         return false;
                     }
                     
                     // Validate destination (index 2) before saving
                     if (!validDestinations.includes(row[2])) {
                         console.warn(`⚠️ Row ${index + 1}: Invalid destination "${row[2]}", skipping...`);
                         return false;
                     }
                     
                     return true;
                 })
                 .map((row, index) => {
                     // 데이터 타입 검증 및 변환 (배열 인덱스 기반) - 완전히 새로 작성
                     try {
                         // 각 필드를 안전하게 추출하고 검증
                         const departureTime = String(row[0] || '').trim();
                         const deliveryNo = String(row[1] || '').trim();
                         const destination = String(row[2] || '').trim();
                         const truckId = String(row[3] || '').trim();
                         const forzaId = String(row[4] || '').trim();
                         const parts = String(row[5] || '').trim();
                         const pagerNo = String(row[6] || '').trim();
                         const status = String(row[7] || 'Scheduled').trim();
                         
                         // 로깅으로 원본 데이터 확인
                         console.log(`🔍 Row ${index + 1} original data:`, row);
                         console.log(`📝 Row ${index + 1} processed data:`, {
                             departureTime, deliveryNo, destination, truckId, forzaId, parts, pagerNo, status
                         });
                         
                         // 추가 검증: destination이 유효한 값인지 확인
                         if (!validDestinations.includes(destination)) {
                             console.error(`❌ Row ${index + 1}: Invalid destination "${destination}" - skipping row`);
                             return null; // 이 행은 건너뛰기
                         }
                         
                         // 추가 검증: 필수 필드만 확인 (Delivery No가 있으면 저장 가능)
                         if (!deliveryNo) {
                             console.warn(`⚠️ Row ${index + 1}: Missing Delivery No - skipping row`);
                             return null; // 이 행은 건너뛰기
                         }
                         
                         // 데이터베이스 컬럼 순서에 맞춰 명시적으로 매핑 (자동 생성 필드 제외)
                         const truckData = {
                             departure_date: selectedDate,
                             departure_time: departureTime,
                             delivery_no: deliveryNo,
                             destination: destination,
                             truck_id: truckId || 'DEFAULT',  // 빈 값 방지
                             forza_id: forzaId || 'DEFAULT',  // 빈 값 방지
                             parts: parts || 'DEFAULT',       // 빈 값 방지
                             pager_no: (pagerNo && pagerNo.trim() !== '') ? pagerNo : null,  // 빈 문자열이면 null로 변환
                             status: status || 'Scheduled'    // 기본값 설정
                             // created_at, updated_at은 데이터베이스에서 자동 생성
                         };
                         
                         console.log(`✅ Row ${index + 1} mapped successfully:`, truckData);
                         return truckData;
                         
                     } catch (error) {
                         console.error(`❌ Error processing row ${index + 1}:`, error);
                         console.error(`❌ Row data:`, row);
                         return null; // 에러 발생 시 해당 행 건너뛰기
                     }
                 });

                         // null 값 제거 (검증 실패한 행들)
             const finalTrucksToSave = trucksToSave.filter(truck => truck !== null);
             
             if (finalTrucksToSave.length === 0) {
                 console.warn('⚠️ No valid trucks to save after validation');
                 this.showStatus('저장할 수 있는 유효한 데이터가 없습니다. 필수 필드를 모두 입력해주세요.', 'warning');
                 return;
             }
             
             console.log(`💾 Saving ${finalTrucksToSave.length} valid trucks to database...`);
             
             // Save to database
             await this.saveTrucksToDatabase(finalTrucksToSave, selectedDate);
            
        } catch (error) {
            console.error('Error in saveTableData:', error);
        }
    }

         // Save all trucks
     async saveAllTrucks() {
         try {
             console.log('💾 Saving all trucks...');
             
             if (!this.currentHotTable) {
                 console.warn('⚠️ No table data to save');
                 return;
             }

             const data = this.currentHotTable.getData();
             const selectedDate = document.getElementById('modalDate').value;
             
             if (!selectedDate) {
                 console.warn('⚠️ Please select a date');
                 return;
             }

             // 모든 행을 저장 (Delivery No가 있는 행만)
             const validData = this.validateTruckData(data, selectedDate);
             if (validData.length === 0) {
                 console.warn('⚠️ 저장할 수 있는 유효한 데이터가 없습니다. Delivery No를 입력해주세요.');
                 return;
             }

             // Save to database
             await this.saveTrucksToDatabase(validData, selectedDate);
             
             // Refresh current trucks display
             await this.loadTrucksFromDatabase();
             this.loadCurrentTrucks();
             
             // 모달은 닫지 않고 계속 편집 가능하도록 유지
             // this.closeExcelModal(); // 이 줄 제거
             
             // Show success message
             this.showStatus(`${validData.length}개 트럭이 성공적으로 저장되었습니다! 계속 편집할 수 있습니다.`, 'success');
             
         } catch (error) {
             console.error('❌ Error saving trucks:', error);
             this.showStatus('Error saving trucks: ' + error.message, 'error');
         }
     }

         // Validate truck data
     validateTruckData(data, selectedDate) {
         const validDestinations = ['VW US', 'VW MX', 'KMX', 'VX US'];
         
                  // Filter valid rows first, then map to data structure
          const validData = data
              .filter((row, index) => {
                  // Delivery No만 필수 필드로 확인 (index 1)
                  if (!row[1] || row[1].toString().trim() === '') {
                      console.log(`⚠️ Row ${index + 1}: Missing Delivery No - skipping row`);
                      return false;
                  }
                  
                  // Validate destination (index 2) if present
                  if (row[2] && !validDestinations.includes(row[2])) {
                      console.warn(`⚠️ Row ${index + 1}: Invalid destination "${row[2]}", skipping...`);
                      return false;
                  }
                  
                  return true;
              })
             .map((row, index) => {
                 // 데이터 타입 검증 및 변환 (배열 인덱스 기반)
                 const departureTime = String(row[0] || '').trim();
                 const deliveryNo = String(row[1] || '').trim();
                 const destination = String(row[2] || '').trim();
                 const truckId = String(row[3] || '').trim();
                 const forzaId = String(row[4] || '').trim();
                 const parts = String(row[5] || '').trim();
                 const pagerNo = String(row[6] || '').trim();
                 const status = String(row[7] || 'Scheduled').trim();
                 
                 // 추가 검증: destination이 유효한 값인지 확인
                 if (!validDestinations.includes(destination)) {
                     console.error(`❌ Row ${index + 1}: Invalid destination "${destination}" - skipping row`);
                     return null; // 이 행은 건너뛰기
                 }
                 
                 // 추가 검증: 필수 필드만 확인 (Delivery No가 있으면 저장 가능)
                 if (!deliveryNo) {
                     console.warn(`⚠️ Row ${index + 1}: Missing Delivery No - skipping row`);
                     return null; // 이 행은 건너뛰기
                 }
                 
                 // 로깅으로 데이터 확인
                 console.log(`✅ Validated Row ${index + 1}:`, {
                     departureTime, deliveryNo, destination, truckId, forzaId, parts, pagerNo, status
                 });
                 
                 // 데이터베이스 컬럼 순서에 맞춰 명시적으로 매핑 (자동 생성 필드 제외)
                 return {
                     departure_date: selectedDate,
                     departure_time: departureTime,
                     delivery_no: deliveryNo,
                     destination: destination,
                     truck_id: truckId,
                     forza_id: forzaId,
                     parts: parts,
                     pager_no: pagerNo,
                     status: status
                     // created_at, updated_at은 데이터베이스에서 자동 생성
                 };
             });
        
                 // null 값 제거 (검증 실패한 행들)
         const finalValidData = validData.filter(truck => truck !== null);
         
         console.log(`✅ Validated ${finalValidData.length} rows out of ${data.length} total rows`);
         return finalValidData;
    }

         // Save trucks to database
     async saveTrucksToDatabase(trucks, date) {
         try {
             console.log('💾 Saving trucks to database:', trucks);
             
             if (!this.supabase || trucks.length === 0) return;

             // 기존 데이터 삭제 후 새로 저장 (UPSERT 방식)
             // First, delete existing trucks for this date
             const { error: deleteError } = await this.supabase
                 .from('vwtm_truck_management')
                 .delete()
                 .eq('departure_date', date);

             if (deleteError) {
                 console.error('Error deleting existing trucks:', deleteError);
                 return;
             }

                          // Insert new trucks - 개선된 에러 처리
              console.log('💾 Final trucks to insert:', trucks);
              
              const { data, error } = await this.supabase
                  .from('vwtm_truck_management')
                  .insert(trucks)
                  .select();

             if (error) {
                 console.error('Error inserting trucks:', error);
                 console.warn('⚠️ Error saving trucks: ' + error.message);
             } else {
                 console.log('✅ Trucks saved successfully:', data);
                 this.showStatus(`${trucks.length}개 트럭이 성공적으로 저장되었습니다!`, 'success');
             }

         } catch (error) {
             console.error('❌ Database error:', error);
             throw error;
         }
     }

    // Load trucks from database
    async loadTrucksFromDatabase() {
        try {
            console.log('📊 Loading trucks from database...');
            
            if (!this.supabase) {
                console.warn('⚠️ Supabase not available, using empty data');
                this.truckData = [];
                return;
            }
            
            const { data, error } = await this.supabase
                .from('vwtm_truck_management')
                .select('*')
                .order('departure_date', { ascending: false })
                .order('departure_time', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            this.truckData = data || [];
            console.log(`✅ Loaded ${this.truckData.length} trucks from database`);
            
        } catch (error) {
            console.error('❌ Error loading trucks:', error);
            this.truckData = [];
        }
    }

    // Load current trucks display
    loadCurrentTrucks() {
        try {
            console.log('📋 Loading current trucks display...');
            
            const container = document.getElementById('currentTrucksTable');
            if (!container) {
                console.error('❌ Container not found');
                return;
            }

            if (this.truckData.length === 0) {
                container.innerHTML = `
                    <p style="text-align: center; color: #7f8c8d; padding: 50px;">
                        No trucks registered yet. Click the button above to open the Excel-style entry form.
                    </p>
                `;
                return;
            }

            // Create table
            const table = this.createTrucksTable(this.truckData);
            container.innerHTML = '';
            container.appendChild(table);
            
            console.log('✅ Current trucks display updated');
            
        } catch (error) {
            console.error('❌ Error loading current trucks:', error);
        }
    }

    // Create trucks table
    createTrucksTable(trucks) {
        const table = document.createElement('table');
        table.className = 'truck-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Date', 'ETD Time', 'Delivery No', 'Destination', 'Truck ID', 'Forza/Brown ID', 'Parts', 'PAGER', 'Status', 'Actions'];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        trucks.forEach(truck => {
            const row = document.createElement('tr');
            
            // Date
            const dateCell = document.createElement('td');
            dateCell.textContent = truck.departure_date;
            row.appendChild(dateCell);
            
            // ETD Time
            const timeCell = document.createElement('td');
            timeCell.textContent = truck.departure_time;
            row.appendChild(timeCell);
            
            // Delivery No
            const deliveryCell = document.createElement('td');
            deliveryCell.textContent = truck.delivery_no;
            row.appendChild(deliveryCell);
            
            // Destination
            const destCell = document.createElement('td');
            destCell.textContent = truck.destination;
            row.appendChild(destCell);
            
            // Truck ID
            const truckCell = document.createElement('td');
            truckCell.textContent = truck.truck_id;
            row.appendChild(truckCell);
            
            // Forza/Brown ID
            const forzaCell = document.createElement('td');
            forzaCell.textContent = truck.forza_id;
            row.appendChild(forzaCell);
            
            // Parts
            const partsCell = document.createElement('td');
            partsCell.textContent = truck.parts;
            row.appendChild(partsCell);
            
            // PAGER
            const pagerCell = document.createElement('td');
            pagerCell.textContent = truck.pager_no;
            row.appendChild(pagerCell);
            
            // Status
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `status-badge status-${truck.status.toLowerCase().replace(' ', '')}`;
            statusBadge.textContent = truck.status;
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning btn-sm';
            editBtn.textContent = '✏️';
            editBtn.onclick = () => this.editTruck(truck);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-secondary btn-sm';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => this.deleteTruck(truck.id);
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsCell.appendChild(actionsDiv);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    // Apply filters
    applyFilters() {
        try {
            console.log('🔍 Applying filters...');
            
            const dateFilter = document.getElementById('dateFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const destinationFilter = document.getElementById('destinationFilter').value;
            const deliveryFilter = document.getElementById('deliveryFilter')?.value;
            
            let filteredData = [...this.truckData];
            
            // Apply date filter
            if (dateFilter) {
                filteredData = filteredData.filter(truck => truck.departure_date === dateFilter);
            }
            
            // Apply status filter
            if (statusFilter) {
                filteredData = filteredData.filter(truck => truck.status === statusFilter);
            }
            
            // Apply destination filter
            if (destinationFilter) {
                filteredData = filteredData.filter(truck => truck.destination === destinationFilter);
            }
            
            // Apply delivery number filter
            if (deliveryFilter) {
                filteredData = filteredData.filter(truck => truck.delivery_no && truck.delivery_no.includes(deliveryFilter));
            }
            
            // Update display
            this.updateFilteredDisplay(filteredData);
            
            // Update filter status
            this.updateFilterStatus(filteredData.length);
            
        } catch (error) {
            console.error('❌ Error applying filters:', error);
        }
    }

    // Update filtered display
    updateFilteredDisplay(filteredData) {
        const container = document.getElementById('currentTrucksTable');
        if (!container) return;
        
        if (filteredData.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: #7f8c8d; padding: 50px;">
                    No trucks found matching the selected filters.
                </p>
            `;
            return;
        }
        
        const table = this.createTrucksTable(filteredData);
        container.innerHTML = '';
        container.appendChild(table);
    }

    // Update filter status
    updateFilterStatus(count) {
        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.textContent = `Showing ${count} trucks`;
        }
    }

    // Clear filters
    clearFilters() {
        try {
            console.log('🗑️ Clearing filters...');
            
            // Reset filter values
            document.getElementById('dateFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('destinationFilter').value = '';
            if (document.getElementById('deliveryFilter')) {
                document.getElementById('deliveryFilter').value = '';
            }
            
            // Reload current trucks display
            this.loadCurrentTrucks();
            
            // Update filter status
            this.updateFilterStatus(this.truckData.length);
            
        } catch (error) {
            console.error('❌ Error clearing filters:', error);
        }
    }

    // Edit truck
    editTruck(truck) {
        try {
            console.log('✏️ Editing truck:', truck);
            
            // Open modal with truck data
            this.openExcelModal();
            
            // Set date and load data
            setTimeout(() => {
                const modalDate = document.getElementById('modalDate');
                if (modalDate) {
                    modalDate.value = truck.departure_date;
                    this.updateModalTable();
                }
            }, 200);
            
        } catch (error) {
            console.error('❌ Error editing truck:', error);
        }
    }

    // Delete truck
    async deleteTruck(truckId) {
        try {
            console.log('🗑️ Deleting truck:', truckId);
            
            if (!confirm('Are you sure you want to delete this truck?')) {
                return;
            }
            
            const { error } = await this.supabase
                .from('vwtm_truck_management')
                .delete()
                .eq('id', truckId);
            
            if (error) {
                throw error;
            }
            
            // Reload data
            await this.loadTrucksFromDatabase();
            this.loadCurrentTrucks();
            
            this.showStatus('Truck deleted successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting truck:', error);
            this.showStatus('Error deleting truck: ' + error.message, 'error');
        }
    }

    // Clear modal table
    clearModalTable() {
        try {
            console.log('🗑️ Clearing modal table...');
            
            if (this.currentHotTable) {
                this.currentHotTable.loadData(this.createSampleData([]));
            }
            
        } catch (error) {
            console.error('❌ Error clearing table:', error);
        }
    }

    // Show status message
    showStatus(message, type = 'info') {
        try {
            const statusElement = document.getElementById('statusMessage');
            if (!statusElement) return;
            
            statusElement.textContent = message;
            statusElement.className = `status-message status-${type}`;
            statusElement.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusElement.classList.add('hidden');
            }, 5000);
            
        } catch (error) {
            console.error('❌ Error showing status:', error);
        }
    }
} // End of TruckManagementSystem class

// Close the conditional check for class definition
}

// Initialize truck system immediately and also when DOM is ready
console.log('🚛 Attempting to initialize Truck Management System...');

function initializeTruckSystem() {
    try {
        // Check if already initialized to prevent duplicates
        if (window.truckSystem) {
            console.log('🚛 Truck Management System already initialized, skipping...');
            return;
        }
        
        console.log('🚛 Creating Truck Management System instance...');
        
        // Create global instance
        window.truckSystem = new TruckManagementSystem();
        
        console.log('✅ Truck Management System ready');
        
    } catch (error) {
        console.error('❌ Error initializing Truck Management System:', error);
        // Try again after a short delay
        setTimeout(initializeTruckSystem, 1000);
    }
}

// Try to initialize immediately
initializeTruckSystem();

// Also try to initialize when DOM is ready (as backup)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM ready, checking Truck Management System...');
    if (!window.truckSystem) {
        console.log('🔄 Truck system not found, initializing now...');
        initializeTruckSystem();
    } else {
        console.log('✅ Truck system already exists');
    }
});

// Also try to initialize after a delay (as another backup)
setTimeout(() => {
    if (!window.truckSystem) {
        console.log('⏰ Delayed initialization attempt...');
        initializeTruckSystem();
    }
}, 2000);
