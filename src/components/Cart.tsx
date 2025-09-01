@@ .. @@
                            <CreditCard className="h-3 w-3 inline mr-1" />
-                            Transferencia (+10%)
+                            Transferencia (+{adminContext?.state?.prices?.transferFeePercentage || 10}%)
                           </button>